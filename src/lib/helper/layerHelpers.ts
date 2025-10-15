import { LayerElementBase, LayerFolder } from "@/store/layers/types";

export type LayerTreeElement = LayerElementBase | LayerFolder;

export function getLayerIdsInFolder(
	folderElements: LayerTreeElement[],
	folderName: string,
	foundIds: Set<string> = new Set(),
): Set<string> {
	folderElements.forEach((item) => {
		if (item.type === "folder") {
			if (item.name === folderName) {
				const flattenFolderChildren = (children: LayerTreeElement[]) => {
					children.forEach((child) => {
						if (child.type === "folder") {
							flattenFolderChildren(child.elements);
						} else if ("id" in child) {
							foundIds.add(child.id);
						}
					});
				};
				flattenFolderChildren(item.elements);
			} else {
				getLayerIdsInFolder(item.elements ?? [], folderName, foundIds);
			}
		}
	});
	return foundIds;
}
