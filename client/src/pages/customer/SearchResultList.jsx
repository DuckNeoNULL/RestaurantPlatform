import { useEffect, useState, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import SearchBar from "../../components/searchbar/SearchSection";
import FilterResult from "./components/Filter/FilterResult"
import ListResult from "./components/search/ListResult";
import { useRestaurant } from "../../hooks/useRestaurant";

/**11
 * ✅ SearchResultList
 * - Gọi API tìm kiếm 1 lần duy nhất khi URL thay đổi
 * - Chỉ cập nhật kết quả khi Redux báo `status = succeeded`
 * - Lọc local qua FilterResult (không gọi lại backend)
 */
const SearchResultList = () => {
  const { search, searchResults, status, error } = useRestaurant();
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const locationHook = useLocation();
  const queryParams = new URLSearchParams(locationHook.search);
  const params = Object.fromEntries(queryParams.entries());

  // ⚙️ Ngăn gọi API nhiều lần
  const hasFetched = useRef(false);

  // 🧠 Reset flag mỗi khi query (URL) đổi
  useEffect(() => {
    hasFetched.current = false;
  }, [locationHook.search]);

  // 🧠 Fetch search result duy nhất một lần khi có param hợp lệ
  useEffect(() => {
    const fetchResults = async () => {
      if (hasFetched.current) return; // chặn gọi trùng

      const normalizedParams = {
        location: params.location || null,
        eventType: params.eventType || null,
        capacity:
          params.tables && !isNaN(Number(params.tables))
            ? Number(params.tables)
            : null,
        date: params.date || null,
        startTime: params.startTime || null,
        endTime: params.endTime || null,
        minPrice: params.minPrice || null,
        maxPrice: params.maxPrice || null,
      };

      // Cho phép search chỉ với location (từ ward cards)
      if (
        !normalizedParams.location &&
        !normalizedParams.eventType &&
        !normalizedParams.capacity &&
        !normalizedParams.date
      ) {
        console.log("⚠️ Thiếu dữ kiện tìm kiếm, bỏ qua API call");
        return;
      }

      // Nếu chỉ có location (slug), vẫn cho phép search
      // Backend sẽ tự động convert slug thành ward name

      hasFetched.current = true;
      console.log("🚀 [SearchResultList] Fetching:", normalizedParams);

      try {
        await search(normalizedParams);
      } catch (err) {
        console.error("❌ Search error:", err);
      }
    };

    fetchResults();
  }, [locationHook.search]);

  // ✅ Khi Redux có kết quả thì hiển thị ra filteredVenues
  useEffect(() => {
    console.log("🔍 [SearchResultList] Status:", status);
    console.log("🔍 [SearchResultList] SearchResults:", searchResults);
    console.log("🔍 [SearchResultList] Is Array:", Array.isArray(searchResults));
    console.log("🔍 [SearchResultList] Length:", searchResults?.length);
    
    if (status === "succeeded" && Array.isArray(searchResults)) {
      console.log("✅ Cập nhật filteredVenues:", searchResults.length);
      setFilteredVenues(searchResults);
      setCurrentPage(1);
    } else if (status === "succeeded" && !Array.isArray(searchResults)) {
      console.warn("⚠️ SearchResults không phải array:", searchResults);
      setFilteredVenues([]);
    }
  }, [status, searchResults]);

  // 🔄 Hàm sort dữ liệu local
  const handleSort = (value) => {
    setSortBy(value);
    if (!filteredVenues?.length) return;

    const sorted = [...filteredVenues];
    switch (value) {
      case "price-low":
        sorted.sort((a, b) => (a.halls?.[0]?.price || 0) - (b.halls?.[0]?.price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.halls?.[0]?.price || 0) - (a.halls?.[0]?.price || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      default:
        break;
    }

    setFilteredVenues(sorted);
    setCurrentPage(1);
  };

  // 🧾 Phân trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVenues = filteredVenues.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 💨 Debounce filter update từ FilterResult
  const filterTimeout = useRef(null);
  const handleFilter = (filteredList) => {
    if (filterTimeout.current) clearTimeout(filterTimeout.current);
    filterTimeout.current = setTimeout(() => {
      setFilteredVenues(filteredList);
      setCurrentPage(1);
    }, 150);
  };

  return (
    <MainLayout>
      {/* 🔍 Thanh tìm kiếm */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <SearchBar noOverlap />
        </div>
      </div>

      {/* 🧭 Nội dung chính */}
      <div style={{ backgroundColor: "#fff", paddingBlock: "40px" }}>
        <div
          style={{
            paddingInline: "50px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
          >
            {/* Bộ lọc bên trái */}
            <div style={{ width: "26%", minWidth: "260px" }}>
              <FilterResult
                venues={searchResults || []}
                onFilter={handleFilter}
              />
            </div>

            {/* Danh sách kết quả */}
            <div style={{ width: "74%", flex: 1 }}>
              {status === "loading" ? (
                <div className="text-center my-5">
                  <Spinner animation="border" />
                  <p className="mt-3 text-muted">Đang tìm kiếm nhà hàng phù hợp...</p>
                </div>
              ) : error ? (
                <p className="text-danger text-center my-5">
                  Đã xảy ra lỗi: {error}
                </p>
              ) : filteredVenues.length > 0 ? (
                <ListResult
                  venues={currentVenues}
                  sortBy={sortBy}
                  onSortChange={handleSort}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredVenues.length}
                />
              ) : status === "succeeded" && searchResults?.length === 0 ? (
                <p className="text-center my-5 text-muted">
                  Không tìm thấy nhà hàng nào phù hợp.
                </p>
              ) : status === "succeeded" && searchResults?.length > 0 && filteredVenues.length === 0 ? (
                <p className="text-center my-5 text-warning">
                  Có {searchResults.length} nhà hàng nhưng đã bị lọc bởi bộ lọc. Vui lòng điều chỉnh bộ lọc.
                </p>
              ) : (
                <p className="text-center my-5 text-muted">
                  Không tìm thấy nhà hàng nào phù hợp.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResultList;
