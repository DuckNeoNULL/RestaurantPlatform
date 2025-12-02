import Hero from "./Hero";
import SearchSection from "../../components/searchbar/SearchSection";
import WardCards from "./WardCards";
import EventTypesSection from "./EventTypeSection";
import BestSellerRestaurant from "./BestSellerRestaurant";
import HighestRatingRestaurant from "./HighesRatingRestaurant";
// import RestaurantPromotions from "@/components/restaurant-promotions"
// import TopRestaurants from "@/components/top-restaurants"
import MainLayout from "../../layouts/LandingPageLayout";
import "../../styles/HomePageStyles.css";
export default function LandingPage() {
    return (
        <div>
            <MainLayout>
                <Hero />
                <SearchSection />
                <main className="container mx-auto px-4 py-12 space-y-12">
                    <WardCards />
                    <EventTypesSection />
                    <BestSellerRestaurant />
                    <HighestRatingRestaurant />
                    {/* <RestaurantPromotions />
                    <EventTypes />
                    <TopRestaurants /> */}
                </main>
            </MainLayout>
        </div>
    )
}
