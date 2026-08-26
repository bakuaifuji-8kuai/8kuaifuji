import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import WarehousePage from "@/pages/Basic/Warehouse";
import PositionPage from "@/pages/Basic/Position";
import CategoryPage from "@/pages/Basic/Category";
import ProductPage from "@/pages/Basic/Product";
import ProductApplicationPage from "@/pages/Basic/ProductApplication";
import ImplementationProjectPage from "@/pages/Basic/ImplementationProjectPage";
import ServiceProjectPage from "@/pages/Basic/ServiceProjectPage";
import WorkOrderProductConfigPage from "@/pages/Basic/WorkOrderProductConfig";
import InboundPage from "@/pages/Inbound/InboundPage";
import OutboundPage from "@/pages/Outbound/OutboundPage";
import ReturnPage from "@/pages/Outbound/ReturnPage";
import ReturnStockPage from "@/pages/Outbound/ReturnStockPage";
import ScrapOutboundPage from "@/pages/Outbound/ScrapOutboundPage";
import DamagedOutboundPage from "@/pages/Outbound/DamagedOutboundPage";
import StockQueryPage from "@/pages/Stock/StockQuery";
import StockCheckPage from "@/pages/Stock/StockCheck";
import StockTransactionPage from "@/pages/Stock/StockTransaction";
import StockTransferPage from "@/pages/Stock/StockTransfer";
import ExhibitionTransferOutboundPage from "@/pages/Stock/ExhibitionTransferOutbound";
import ExhibitionTransferInboundPage from "@/pages/Stock/ExhibitionTransferInbound";
import StockReportPage from "@/pages/Report/StockReport";
import InboundReportPage from "@/pages/Report/InboundReport";
import OutboundReportPage from "@/pages/Report/OutboundReport";
import InboundDetailReport from "@/pages/Report/InboundDetailReport";
import OutboundDetailReport from "@/pages/Report/OutboundDetailReport";
import LowValueAgingReportPage from "@/pages/Report/LowValueAgingReport";
import StockSluggishReportPage from "@/pages/Report/StockSluggishReport";
import AssetListPage from "@/pages/Report/Asset/AssetList";
import AssetInboundPage from "@/pages/Report/Asset/AssetInbound";
import AssetRequisitionPage from "@/pages/Report/Asset/AssetRequisition";
import AssetReturnPage from "@/pages/Report/Asset/AssetReturn";
import AssetTransferPage from "@/pages/Report/Asset/AssetTransfer";
import AssetScrapPage from "@/pages/Report/Asset/AssetScrap";
import AssetLossPage from "@/pages/Report/Asset/AssetLoss";

import AssetReportPage from "@/pages/Report/Asset/AssetReport";
import MeetingNotesPage from "@/pages/Report/Asset/MeetingNotes";
import ExhibitionRequisitionReport from "@/pages/Report/ExhibitionRequisitionReport";
import ExhibitionRequisitionDetailReport from "@/pages/Report/ExhibitionRequisitionDetailReport";
import BusinessFlowChart from "@/pages/Report/BusinessFlowChart";
// 采购管理模块
import ProcurementPlanPage from "@/pages/Procurement/ProcurementPlanPage";
import ProcurementDemandPage from "@/pages/Procurement/ProcurementDemandPage";
import ContractLedgerPage from "@/pages/Procurement/ContractLedgerPage";
import ContractArchivePage from "@/pages/Procurement/ContractArchivePage";
import ProcurementOrderPage from "@/pages/Procurement/ProcurementOrderPage";
import SupplierPage from "@/pages/Procurement/SupplierPage";
import ProcurementInspectionPage from "@/pages/Procurement/ProcurementInspectionPage";
import CompetitiveBiddingPage from "@/pages/Procurement/CompetitiveBiddingPage";
import SupplierQuotePage from "@/pages/Procurement/SupplierQuotePage";
import WebsiteInfoPage from "@/pages/Procurement/WebsiteInfoPage";
import ContractTemplatePage from "@/pages/Procurement/ContractTemplatePage";
import ProcurementFunctionDocs from "@/pages/Procurement/ProcurementFunctionDocs";
import ApprovalFlowConfigPage from "@/pages/Procurement/ApprovalFlowConfigPage";
import ContractPurchaseOrderPage from "@/pages/Procurement/ContractPurchaseOrderPage";
import ProcurementPlanSummaryPage from "@/pages/Procurement/ProcurementPlanSummaryPage";
import EvaluationTemplatePage from "@/pages/Procurement/EvaluationTemplatePage";
import EvaluationExecutePage from "@/pages/Procurement/EvaluationExecutePage";
import EvaluationRecordPage from "@/pages/Procurement/EvaluationRecordPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<StockQueryPage />} />

          {/* 基础资料 */}
          <Route path="basic/warehouse" element={<WarehousePage />} />
          <Route path="basic/position" element={<PositionPage />} />
          <Route path="basic/category" element={<CategoryPage />} />
          <Route path="basic/product" element={<ProductPage />} />
          <Route path="basic/product-application" element={<ProductApplicationPage />} />
          <Route path="basic/implementation-project" element={<ImplementationProjectPage />} />
          <Route path="basic/service-project" element={<ServiceProjectPage />} />
          <Route path="basic/workorder-product-config" element={<WorkOrderProductConfigPage />} />

          {/* 入库管理 */}
          <Route path="inbound/purchase" element={<InboundPage type="purchase" />} />
          <Route path="inbound/production" element={<InboundPage type="production" />} />
          <Route path="inbound/return-inbound" element={<ReturnPage />} />
          <Route path="inbound/return-stock" element={<ReturnStockPage />} />

          {/* 出库管理 */}
          <Route path="outbound/lowvalue" element={<OutboundPage type="lowvalue" />} />
          <Route path="outbound/exhibition" element={<OutboundPage type="exhibition" />} />
          <Route path="outbound/scrap" element={<ScrapOutboundPage />} />
          <Route path="outbound/damaged" element={<DamagedOutboundPage />} />

          {/* 库存管理 */}
          <Route path="stock/query" element={<StockQueryPage />} />
          <Route path="stock/check" element={<StockCheckPage />} />
          <Route path="stock/transaction" element={<StockTransactionPage />} />
          <Route path="stock/exhibition-transfer-outbound" element={<ExhibitionTransferOutboundPage />} />
          <Route path="stock/exhibition-transfer-inbound" element={<ExhibitionTransferInboundPage />} />
          <Route path="stock/transfer" element={<StockTransferPage />} />

          {/* 固定资产管理 */}
          <Route path="asset/list" element={<AssetListPage />} />
          <Route path="asset/inbound" element={<AssetInboundPage />} />
          <Route path="asset/requisition" element={<AssetRequisitionPage />} />
          <Route path="asset/return" element={<AssetReturnPage />} />
          <Route path="asset/transfer" element={<AssetTransferPage />} />
          <Route path="asset/scrap" element={<AssetScrapPage />} />
          <Route path="asset/loss" element={<AssetLossPage />} />
          <Route path="asset/report" element={<AssetReportPage />} />
          <Route path="asset/meeting-notes" element={<MeetingNotesPage />} />

          {/* 采购管理 */}
          <Route path="procurement/plan" element={<ProcurementPlanPage />} />
          <Route path="procurement/plan-summary" element={<ProcurementPlanSummaryPage />} />
          <Route path="procurement/demand" element={<ProcurementDemandPage />} />
          <Route path="procurement/contract" element={<ContractLedgerPage />} />
          <Route path="procurement/contract-archive" element={<ContractArchivePage />} />
          <Route path="procurement/contract-purchase-order" element={<ContractPurchaseOrderPage />} />
          <Route path="procurement/order" element={<ProcurementOrderPage />} />
          <Route path="procurement/supplier" element={<SupplierPage />} />
          <Route path="procurement/inspection" element={<ProcurementInspectionPage />} />
          <Route path="procurement/bidding" element={<CompetitiveBiddingPage />} />
          <Route path="procurement/supplier-quote" element={<SupplierQuotePage />} />
          <Route path="procurement/website-info" element={<WebsiteInfoPage />} />
          <Route path="procurement/contract-template" element={<ContractTemplatePage />} />
          <Route path="procurement/function-docs" element={<ProcurementFunctionDocs />} />
          <Route path="procurement/approval-flow" element={<ApprovalFlowConfigPage />} />
          <Route path="procurement/evaluation-template" element={<EvaluationTemplatePage />} />
          <Route path="procurement/evaluation-execute" element={<EvaluationExecutePage />} />
          <Route path="procurement/evaluation-record" element={<EvaluationRecordPage />} />

          {/* 报表管理 */}
          <Route path="report/stock" element={<StockReportPage />} />
          <Route path="report/inbound" element={<InboundReportPage />} />
          <Route path="report/outbound" element={<OutboundReportPage />} />
          <Route path="report/exhibition-requisition" element={<ExhibitionRequisitionReport />} />
          <Route path="report/exhibition-requisition-detail" element={<ExhibitionRequisitionDetailReport />} />
          <Route path="report/inbound-detail" element={<InboundDetailReport />} />
          <Route path="report/outbound-detail" element={<OutboundDetailReport />} />
          <Route path="report/aging" element={<LowValueAgingReportPage />} />
          <Route path="report/sluggish" element={<StockSluggishReportPage />} />
          <Route path="report/business-flow" element={<BusinessFlowChart />} />
        </Route>
      </Routes>
    </Router>
  );
}
