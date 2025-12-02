import React from "react";
import CustomerInfoSection from "./CustomerInfoSection";
import BookingInfoSection from "./BookingInforSection";
// import BookingItemsTable from "./BookingItemsTable";

const BookingForm = ({menus, services, restaurant, hall, user, searchData, promotions }) => {
  return (
    <form className="space-y-6">
      <CustomerInfoSection user={user} />
      <BookingInfoSection menus={menus} services={services} restaurant={restaurant} hall={hall} searchData={searchData} promotions={promotions} />
      {/* <BookingItemsTable /> */}
    </form>
  );
};

export default BookingForm;
