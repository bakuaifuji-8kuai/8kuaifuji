import flowWarehouse from './flow-warehouse.svg?raw';
import flowInbound from './flow-inbound.svg?raw';
import flowOutbound from './flow-outbound.svg?raw';
import flowExhibitionTransfer from './flow-exhibition-transfer.svg?raw';
import flowTransfer from './flow-transfer.svg?raw';
import flowFixedAsset from './flow-fixed-asset.svg?raw';
import flowBasicData from './flow-basic-data.svg?raw';
import erDiagram from './er-diagram.svg?raw';
import mindmap from './mindmap.svg?raw';
import systemArchitecture from './system-architecture.svg?raw';
import agentArchitecture from './agent-architecture.svg?raw';

export const diagramMap: Record<string, string> = {
  'flow-warehouse.svg': flowWarehouse,
  'flow-inbound.svg': flowInbound,
  'flow-outbound.svg': flowOutbound,
  'flow-exhibition-transfer.svg': flowExhibitionTransfer,
  'flow-transfer.svg': flowTransfer,
  'flow-fixed-asset.svg': flowFixedAsset,
  'flow-basic-data.svg': flowBasicData,
  'er-diagram.svg': erDiagram,
  'mindmap.svg': mindmap,
  'system-architecture.svg': systemArchitecture,
  'agent-architecture.svg': agentArchitecture,
};

export const getSvgContent = (fileName: string): string => {
  return diagramMap[fileName] || '';
};
