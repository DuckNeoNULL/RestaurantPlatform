import * as XLSX from "xlsx";

const exportToExcel = (data, fileName) => {
  // Chuyển dữ liệu JSON thành sheet Excel
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Tạo workbook chứa sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Ghi file Excel
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};



export default exportToExcel;