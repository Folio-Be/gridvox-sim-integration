/**
 * MEB (Mesh Binary) Parser
 * 
 * Parses decrypted .MEB files from AMS2/Project Cars.
 * Based on PCarsTools MeshBinary.cs implementation.
 * 
 * Reference: https://github.com/Nenkai/PCarsTools/blob/main/PCarsTools/Model/MeshBinary.cs
 */

import * as fs from 'fs';

/**
 * DirectX vertex format types
 * Reference: https://learn.microsoft.com/en-us/windows/win32/api/dxgiformat/ne-dxgiformat-dxgi_format
 */
enum DXGI_FORMAT {
    UNKNOWN = 0,
    R32G32B32A32_TYPELESS = 1,
    R32G32B32A32_FLOAT = 2,
    R32G32B32A32_UINT = 3,
    R32G32B32A32_SINT = 4,
    R32G32B32_TYPELESS = 5,
    R32G32B32_FLOAT = 6,
    R32G32B32_UINT = 7,
    R32G32B32_SINT = 8,
    R16G16B16A16_FLOAT = 10,
    R32G32_FLOAT = 16,
    D32_FLOAT_S8X24_UINT = 20, // Encrypted position format
    R8G8B8A8_UNORM = 28,
    R16G16_FLOAT = 34,
}

enum SemanticName {
    POSITION = 0,
    BLENDWEIGHT = 1,
    NORMAL = 2,
    TEXCOORD = 3,
    TANGENT = 4,
    BINORMAL = 5,
    COLOR = 6,
    DEPTH = 7,
    BLENDINDICES = 8,
}

interface VertexStream {
    format: DXGI_FORMAT;
    semantic: SemanticName;
    semanticIndex: number;
    data: Float32Array;
}

export interface MeshData {
    name: string;
    vertices: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    tangents?: Float32Array;
    colors?: Float32Array;
    indices?: Uint16Array | Uint32Array;
    vertexCount: number;
}

export class MebParser {
    private buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    /**
     * Parse .MEB file and extract mesh data
     */
    parse(): MeshData {
        // Read version (4 bytes)
        const versionValue = this.readUInt32();
        const major = (versionValue >> 16) & 0xFFFF;
        const minor = versionValue & 0xFFFF;
        console.log(`MEB Version: ${major}.${minor}`);

        // Read flags based on version
        let hasBones = false;
        if (minor === 2) {
            hasBones = this.readBoolean();
        } else if (minor >= 4) {
            hasBones = this.readBoolean();
            this.readBoolean(); // dynamicEnvMapRequired
            this.offset += 2; // padding
        }

        if (minor >= 6) {
            this.offset += 2; // flags, cpuReason, empty, unkBool, padding
        }

        // Read mesh name (null-terminated string)
        const name = this.readNullTerminatedString();
        console.log(`Mesh Name: ${name}`);

        // Align to 4 bytes
        if (minor >= 4) {
            this.alignTo(4);
        }

        // Read vertex/stream counts
        const numVertsPerStream = this.readInt32();
        const numStreams = this.readInt32();
        const numIndexBuffers = this.readInt32();

        console.log(`Vertices: ${numVertsPerStream}, Streams: ${numStreams}, Index Buffers: ${numIndexBuffers}`);

        // Skip bounding box data (6 floats = 24 bytes)
        this.offset += 24;

        // Read bone data if present
        if (hasBones && minor >= 2) {
            const numBones = this.readInt32();
            this.readInt32(); // boneStrSize

            // Skip bone names
            for (let i = 0; i < numBones; i++) {
                this.readNullTerminatedString();
            }
            this.alignTo(4);

            // Skip bone matrices (0x10 bytes * numBones * 3)
            this.offset += 0x10 * numBones * 3;
        }

        // Parse vertex streams
        const streams: VertexStream[] = [];
        for (let i = 0; i < numStreams; i++) {
            const format = this.readInt32() as DXGI_FORMAT;
            const semantic = this.readInt32() as SemanticName;
            const semanticIndex = this.readInt32();

            console.log(`Stream ${i}: ${SemanticName[semantic]} (${DXGI_FORMAT[format]})`);

            // Read vertex data based on format
            const data = this.readVertexData(format, semantic, numVertsPerStream);

            streams.push({
                format,
                semantic,
                semanticIndex,
                data,
            });
        }

        // Parse index buffers
        let indices: Uint16Array | Uint32Array | undefined;
        for (let i = 0; i < numIndexBuffers; i++) {
            const indexFormat = this.readInt32() as DXGI_FORMAT;
            const indexCount = this.readInt32();

            console.log(`Index Buffer ${i}: ${indexCount} indices (${DXGI_FORMAT[indexFormat]})`);

            // R16_UINT format = 57 in DirectX
            if (indexFormat === DXGI_FORMAT.R16G16_FLOAT || (indexFormat as number) === 57) {
                // 16-bit indices
                const data = new Uint16Array(indexCount);
                for (let j = 0; j < indexCount; j++) {
                    data[j] = this.readUInt16();
                }
                indices = data;
            } else if (indexFormat === DXGI_FORMAT.R32G32_FLOAT) {
                // 32-bit indices
                const data = new Uint32Array(indexCount);
                for (let j = 0; j < indexCount; j++) {
                    data[j] = this.readUInt32();
                }
                indices = data;
            }
        }

        // Extract specific vertex attributes
        const positionStream = streams.find(s => s.semantic === SemanticName.POSITION);
        const normalStream = streams.find(s => s.semantic === SemanticName.NORMAL);
        const uvStream = streams.find(s => s.semantic === SemanticName.TEXCOORD);
        const tangentStream = streams.find(s => s.semantic === SemanticName.TANGENT);
        const colorStream = streams.find(s => s.semantic === SemanticName.COLOR);

        if (!positionStream) {
            throw new Error('No POSITION stream found in MEB file');
        }

        return {
            name,
            vertices: positionStream.data,
            normals: normalStream?.data,
            uvs: uvStream?.data,
            tangents: tangentStream?.data,
            colors: colorStream?.data,
            indices,
            vertexCount: numVertsPerStream,
        };
    }

    /**
     * Read vertex data based on DirectX format and semantic type
     */
    private readVertexData(format: DXGI_FORMAT, _semantic: SemanticName, count: number): Float32Array {
        const componentsPerVertex = this.getComponentCount(format);
        const data = new Float32Array(count * componentsPerVertex);
        let index = 0;

        for (let i = 0; i < count; i++) {
            switch (format) {
                case DXGI_FORMAT.R32G32B32A32_FLOAT:
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    break;

                case DXGI_FORMAT.R32G32B32_FLOAT:
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    break;

                case DXGI_FORMAT.R32G32_FLOAT:
                    data[index++] = this.readFloat();
                    data[index++] = this.readFloat();
                    break;

                case DXGI_FORMAT.R16G16B16A16_FLOAT:
                    data[index++] = this.readFloat16();
                    data[index++] = this.readFloat16();
                    data[index++] = this.readFloat16();
                    data[index++] = this.readFloat16();
                    break;

                case DXGI_FORMAT.R16G16_FLOAT:
                    data[index++] = this.readFloat16();
                    data[index++] = this.readFloat16();
                    break;

                case DXGI_FORMAT.R8G8B8A8_UNORM:
                    // Normalized 8-bit to float [0, 1]
                    data[index++] = this.buffer.readUInt8(this.offset++) / 255.0;
                    data[index++] = this.buffer.readUInt8(this.offset++) / 255.0;
                    data[index++] = this.buffer.readUInt8(this.offset++) / 255.0;
                    data[index++] = this.buffer.readUInt8(this.offset++) / 255.0;
                    break;

                default:
                    // Unsupported format - try reading as floats
                    console.warn(`Unsupported format ${DXGI_FORMAT[format]}, reading as floats`);
                    for (let j = 0; j < componentsPerVertex; j++) {
                        data[index++] = this.readFloat();
                    }
            }
        }

        return data;
    }

    /**
     * Get number of components per vertex for a given format
     */
    private getComponentCount(format: DXGI_FORMAT): number {
        switch (format) {
            case DXGI_FORMAT.R32G32B32A32_FLOAT:
            case DXGI_FORMAT.R16G16B16A16_FLOAT:
            case DXGI_FORMAT.R8G8B8A8_UNORM:
                return 4;
            case DXGI_FORMAT.R32G32B32_FLOAT:
                return 3;
            case DXGI_FORMAT.R32G32_FLOAT:
            case DXGI_FORMAT.R16G16_FLOAT:
                return 2;
            default:
                return 3; // Default to vec3
        }
    }

    // Buffer reading utilities
    private readUInt8(): number {
        return this.buffer.readUInt8(this.offset++);
    }

    private readUInt16(): number {
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    private readInt32(): number {
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    private readUInt32(): number {
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    private readFloat(): number {
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }

    private readFloat16(): number {
        // Read 16-bit float (half precision)
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;

        // Convert half float to float
        // Reference: https://en.wikipedia.org/wiki/Half-precision_floating-point_format
        const sign = (value & 0x8000) >> 15;
        const exponent = (value & 0x7C00) >> 10;
        const fraction = value & 0x03FF;

        if (exponent === 0) {
            return (sign ? -1 : 1) * Math.pow(2, -14) * (fraction / 1024);
        } else if (exponent === 0x1F) {
            return fraction ? NaN : (sign ? -Infinity : Infinity);
        }

        return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
    }

    private readBoolean(): boolean {
        return this.buffer.readUInt8(this.offset++) !== 0;
    }

    private readNullTerminatedString(): string {
        let str = '';
        while (this.offset < this.buffer.length) {
            const char = this.buffer.readUInt8(this.offset++);
            if (char === 0) break;
            str += String.fromCharCode(char);
        }
        return str;
    }

    private alignTo(alignment: number): void {
        const remainder = this.offset % alignment;
        if (remainder !== 0) {
            this.offset += alignment - remainder;
        }
    }

    /**
     * Parse MEB file from disk
     */
    static parseFile(filePath: string): MeshData {
        const buffer = fs.readFileSync(filePath);
        const parser = new MebParser(buffer);
        return parser.parse();
    }
}
