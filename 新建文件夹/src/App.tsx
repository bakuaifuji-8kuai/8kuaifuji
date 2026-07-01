import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import WarehousePage from "@/pages/Basic/Warehouse";
import PositionPage from "@/pages/Basic/Position";
import CategoryPage from "@/pages/Basic/Category";
import SupplierPage from "@/pages/Basic/Supplier";
import InboundPage from "@/pages/Inbound/InboundPage";
import OutboundPage from "@/pages/Outbound/OutboundPage";
import ReturnPage from "@/pages/Outbound/ReturnPage";
import ScrapOutboundPage from "@/pages/Outbound/ScrapOutboundPage";
import DamagedOutboundPage from "@/pages/Outbound/DamagedOutboundPage";
import StockQueryPage from "@/pages/Stock/StockQuery";
import StockCheckPage from "@/pages/Stock/StockCheck";
import StockTransactionPage from "@/pages/Stock/StockTransaction";
import StockReportPage from "@/pages/Report/StockReport";
import InboundReportPage from "@/pages/Report/InboundReport";
import OutboundReportPage from "@/pages/Report/OutboundReport";
import LowValueAgingReportPage from "@/pages/Report/LowValueAgingReport";
import StockSluggishReportPage from "@/pages/Report/StockSluggishReport";

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
          <Route path="basic/supplier" element={<SupplierPage />} />

          {/* 入库管理 */}
          <Route path="inbound/purchase" element={<InboundPage type="purchase" />} />
          <Route path="inbound/production" element={<InboundPage type="production" />} />
          <Route path="inbound/return" element={<InboundPage type="return" />} />

          {/* 出库管理 */}
          <Route path="outbound/requisition" element={<OutboundPage type="requisition" />} />
          <Route path="outbound/return" element={<ReturnPage />} />
          <Route path="outbound/production" element={<OutboundPage type="production" />} />
          <Route path="outbound/scrap" element={<ScrapOutboundPage />} />
          <Route path="outbound/damaged" element={<DamagedOutboundPage />} />

          {/* 库存管理 */}
          <Route path="stock/query" element={<StockQueryPage />} />
          <Route path="stock/check" element={<StockCheckPage />} />
          <Route path="stock/transaction" element={<StockTransactionPage />} />

          {/* 报表管理 */}
          <Route path="report/stock" element={<StockReportPage />} />
          <Route path="report/inbound" element={<InboundReportPage />} />
          <Route path="report/outbound" element={<OutboundReportPage />} />
          <Route path="report/aging" element={<LowValueAgingReportPage />} />
          <Route path="report/sluggish" element={<StockSluggishReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
