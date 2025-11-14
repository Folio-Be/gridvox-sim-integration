"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const node_assert_1 = __importDefault(require("node:assert"));
const labelRepository_1 = require("../src/automation/vision/labelRepository");
const yoloDetectorAdapter_1 = require("../src/automation/vision/yoloDetectorAdapter");
const paddleOcrAdapter_1 = require("../src/automation/vision/paddleOcrAdapter");
const hybridLayoutParser_1 = require("../src/automation/vision/hybridLayoutParser");
const visionLayoutParser_1 = require("../src/automation/vision/visionLayoutParser");
async function run() {
    const labelsDir = (0, node_path_1.join)(__dirname, '..', 'data', 'labels');
    const repo = new labelRepository_1.LabelRepository(labelsDir);
    const parser = new visionLayoutParser_1.VisionLayoutParser(new hybridLayoutParser_1.HybridLayoutParser(new yoloDetectorAdapter_1.YoloDetectorAdapter(repo), new paddleOcrAdapter_1.PaddleOcrAdapter(repo)));
    const result = await parser.refreshLayout('sample-car-grid.png');
    (0, node_assert_1.default)(result.elements.length > 0, 'Expected elements from label replay');
    const tile = parser.findElementByText('Mercedes-AMG GT3');
    (0, node_assert_1.default)(tile, 'Expected Mercedes tile');
    console.log('layoutParser.spec.ts passed', {
        totalElements: result.elements.length,
        foundElement: tile?.id,
    });
}
run().catch((err) => {
    console.error('layoutParser.spec.ts failed', err);
    process.exit(1);
});
//# sourceMappingURL=layoutParser.spec.js.map