/**
 * MEB to glTF Converter
 * 
 * Converts parsed MEB mesh data to glTF 2.0 format.
 * Handles coordinate system transformation from DirectX (Z-up) to glTF (Y-up).
 */

import { Document, Accessor } from '@gltf-transform/core';
import { MeshData } from '../parsers/MebParser.js';

export interface ConversionOptions {
    /** Convert from DirectX Z-up to glTF Y-up coordinate system */
    convertCoordinates?: boolean;
    /** Flip UV coordinates (V axis) */
    flipUVs?: boolean;
    /** Name for the mesh in glTF */
    meshName?: string;
}

export class MebToGltfConverter {
    private document: Document;

    constructor() {
        this.document = new Document();
    }

    /**
     * Convert MEB mesh data to glTF document
     */
    convert(meshData: MeshData, options: ConversionOptions = {}): Document {
        const {
            convertCoordinates = true,
            flipUVs = false,
            meshName = meshData.name || 'Track',
        } = options;

        console.log(`Converting mesh: ${meshName}`);
        console.log(`Vertices: ${meshData.vertexCount}`);
        console.log(`Has normals: ${!!meshData.normals}`);
        console.log(`Has UVs: ${!!meshData.uvs}`);
        console.log(`Has indices: ${!!meshData.indices}`);

        // Create material
        const material = this.document.createMaterial(meshName + '_Material')
            .setBaseColorFactor([0.8, 0.8, 0.8, 1.0])
            .setRoughnessFactor(0.8)
            .setMetallicFactor(0.2);

        // Create mesh
        const mesh = this.document.createMesh(meshName);

        // Create primitive
        const primitive = this.document.createPrimitive()
            .setMaterial(material);

        // Transform vertices if needed
        const vertices = convertCoordinates
            ? this.transformVertices(meshData.vertices)
            : meshData.vertices;

        // Add POSITION attribute
        const positionAccessor = this.createAccessor(
            vertices,
            'VEC3',
            meshData.vertexCount
        );
        primitive.setAttribute('POSITION', positionAccessor);

        // Add NORMAL attribute if available
        if (meshData.normals) {
            const normals = convertCoordinates
                ? this.transformNormals(meshData.normals)
                : meshData.normals;

            const normalAccessor = this.createAccessor(
                normals,
                'VEC3',
                meshData.vertexCount
            );
            primitive.setAttribute('NORMAL', normalAccessor);
        }

        // Add TEXCOORD_0 attribute if available
        if (meshData.uvs) {
            const uvs = flipUVs
                ? this.flipUVCoordinates(meshData.uvs)
                : meshData.uvs;

            const uvAccessor = this.createAccessor(
                uvs,
                'VEC2',
                meshData.vertexCount
            );
            primitive.setAttribute('TEXCOORD_0', uvAccessor);
        }

        // Add TANGENT attribute if available
        if (meshData.tangents) {
            const tangents = convertCoordinates
                ? this.transformTangents(meshData.tangents)
                : meshData.tangents;

            const tangentAccessor = this.createAccessor(
                tangents,
                'VEC4',
                meshData.vertexCount
            );
            primitive.setAttribute('TANGENT', tangentAccessor);
        }

        // Add COLOR_0 attribute if available
        if (meshData.colors) {
            const colorAccessor = this.createAccessor(
                meshData.colors,
                'VEC4',
                meshData.vertexCount
            );
            primitive.setAttribute('COLOR_0', colorAccessor);
        }

        // Add indices if available
        if (meshData.indices) {
            const indexAccessor = this.createIndexAccessor(meshData.indices);
            primitive.setIndices(indexAccessor);
        }

        mesh.addPrimitive(primitive);

        // Create scene with mesh
        const node = this.document.createNode(meshName + '_Node')
            .setMesh(mesh);

        this.document.createScene('Scene')
            .addChild(node);

        return this.document;
    }

    /**
     * Transform vertices from DirectX (Z-up, left-handed) to glTF (Y-up, right-handed)
     * Transformation: (x, y, z) → (x, z, -y)
     */
    private transformVertices(vertices: Float32Array): Float32Array {
        const transformed = new Float32Array(vertices.length);

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            transformed[i] = x;      // X stays the same
            transformed[i + 1] = z;  // Z becomes Y
            transformed[i + 2] = -y; // -Y becomes Z
        }

        return transformed;
    }

    /**
     * Transform normals from DirectX to glTF coordinate system
     */
    private transformNormals(normals: Float32Array): Float32Array {
        // Same transformation as vertices for direction vectors
        return this.transformVertices(normals);
    }

    /**
     * Transform tangents from DirectX to glTF coordinate system
     * Tangents are vec4 (xyz = direction, w = handedness)
     */
    private transformTangents(tangents: Float32Array): Float32Array {
        const transformed = new Float32Array(tangents.length);

        for (let i = 0; i < tangents.length; i += 4) {
            const x = tangents[i];
            const y = tangents[i + 1];
            const z = tangents[i + 2];
            const w = tangents[i + 3];

            transformed[i] = x;      // X stays the same
            transformed[i + 1] = z;  // Z becomes Y
            transformed[i + 2] = -y; // -Y becomes Z
            transformed[i + 3] = w;  // Handedness stays the same
        }

        return transformed;
    }

    /**
     * Flip UV coordinates (V axis)
     * DirectX: V increases downward (0 = top)
     * glTF: V increases upward (0 = bottom)
     */
    private flipUVCoordinates(uvs: Float32Array): Float32Array {
        const flipped = new Float32Array(uvs.length);

        for (let i = 0; i < uvs.length; i += 2) {
            flipped[i] = uvs[i];         // U stays the same
            flipped[i + 1] = 1.0 - uvs[i + 1]; // Flip V
        }

        return flipped;
    }

    /**
     * Create glTF accessor for vertex attribute data
     */
    private createAccessor(
        data: Float32Array,
        type: 'VEC2' | 'VEC3' | 'VEC4',
        _count: number
    ): Accessor {
        const componentsPerElement = type === 'VEC2' ? 2 : type === 'VEC3' ? 3 : 4;

        // Calculate min/max for bounding box
        const min = new Array(componentsPerElement).fill(Infinity);
        const max = new Array(componentsPerElement).fill(-Infinity);

        for (let i = 0; i < data.length; i++) {
            const componentIndex = i % componentsPerElement;
            min[componentIndex] = Math.min(min[componentIndex], data[i]);
            max[componentIndex] = Math.max(max[componentIndex], data[i]);
        }

        // Create buffer and accessor
        const buffer = this.document.createBuffer();
        const accessor = this.document.createAccessor()
            .setType(type)
            .setArray(data)
            .setBuffer(buffer);

        // Note: min/max are automatically calculated by gltf-transform when using setArray

        return accessor;
    }

    /**
     * Create glTF accessor for index data
     */
    private createIndexAccessor(indices: Uint16Array | Uint32Array): Accessor {
        const buffer = this.document.createBuffer();
        return this.document.createAccessor()
            .setType('SCALAR')
            .setArray(indices)
            .setBuffer(buffer);
    }

    /**
     * Get the glTF document
     */
    getDocument(): Document {
        return this.document;
    }
}
