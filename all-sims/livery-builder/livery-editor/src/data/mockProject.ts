import type {
  Layer,
  LayerTreeNode,
  LiveryProject,
  LiveryTexture,
  PreviewSnapshot,
  ReferenceImage,
  SelectionGroup,
} from "../types";

const now = new Date();
const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const flattenLayers = (nodes: LayerTreeNode[]): Layer[] =>
  nodes.flatMap((node) => {
    if (node.nodeType === "layer") {
      const { nodeType, parentId, ...rest } = node;
      return [{ ...rest } as Layer];
    }
    return flattenLayers(node.children);
  });

const buildLayerTree = (): LayerTreeNode[] => [
  {
    nodeType: "folder",
    id: "fld-uv",
    name: "Template Layers",
    folderType: "mask",
    visible: false,
    locked: true,
    children: [
      {
        nodeType: "layer",
        id: "layer-uv-wrap",
        name: "UV Wrap",
        type: "image",
        visible: false,
        locked: true,
        opacity: 40,
        blendMode: "normal",
        x: 0,
        y: 0,
        width: 4096,
        height: 4096,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      {
        nodeType: "layer",
        id: "layer-mask",
        name: "Mask Layer",
        type: "shape",
        visible: false,
        locked: true,
        opacity: 100,
        blendMode: "normal",
        x: 0,
        y: 0,
        width: 4096,
        height: 4096,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        data: { shapeType: "rectangle", fill: "#ffffff" },
      },
    ],
  },
  {
    nodeType: "folder",
    id: "fld-body",
    name: "Bodywork",
    folderType: "regular",
    visible: true,
    locked: false,
    children: [],
  },
];

const buildTexture = (override: Partial<LiveryTexture>): LiveryTexture => {
  const tree = buildLayerTree();
  const layers = flattenLayers(tree);
  return {
    id: override.id ?? generateId("tex"),
    name: override.name ?? "car_body.dds",
    type: override.type ?? "body",
    width: 4096,
    height: 4096,
    format: "DDS",
    layers,
    layerTree: tree,
    ...override,
  };
};

export const mockProject: LiveryProject = {
  id: "proj-mock-001",
  name: "porsche_911_gt3.sve",
  simulator: "AMS2",
  car: "Porsche 911 GT3",
  textures: [
    buildTexture({
      id: "tex-body",
      name: "car_body.dds",
      type: "body",
      thumbnail: "https://placehold.co/48x48/101827/7dd3fc?text=B",
    }),
    buildTexture({
      id: "tex-windows",
      name: "windows.dds",
      type: "windows",
      thumbnail: "https://placehold.co/48x48/111b2d/93c5fd?text=W",
    }),
    buildTexture({
      id: "tex-wheels",
      name: "wheels.dds",
      type: "wheels",
      thumbnail: "https://placehold.co/48x48/0f172a/f472b6?text=R",
    }),
  ],
  metadata: {
    author: "SimVox Mock",
    team: "Factory",
    season: "2025",
    tags: ["gt3", "demo", "mock"],
  },
  createdAt: now,
  updatedAt: now,
};

export const mockSelectionGroups: SelectionGroup[] = [];

export const mockReferenceImages: ReferenceImage[] = [
  {
    id: "ref-01",
    name: "Inspiration 01",
    url: "https://placehold.co/240x150/1e293b/94a3b8?text=Reference+A",
    width: 240,
    height: 150,
    opacity: 100,
    alwaysOnTop: false,
  },
  {
    id: "ref-02",
    name: "Sponsor Moodboard",
    url: "https://placehold.co/240x150/0f172a/cbd5f5?text=Reference+B",
    width: 240,
    height: 150,
    opacity: 100,
    alwaysOnTop: false,
  },
];

export const mockPreviewSnapshots: PreviewSnapshot[] = [
  {
    id: "prev-01",
    title: "3D Preview",
    description: "Live LOD from showroom camera",
    updatedAt: now,
    textureName: "car_body.dds",
    camera: "Orbit",
    thumbnail: "https://placehold.co/320x200/111827/94a3b8?text=3D+Preview",
  },
];
