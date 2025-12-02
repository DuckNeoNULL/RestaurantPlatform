import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  // categories
  fetchDishCategoriesByRestaurant,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
  // menus
  fetchMenusByRestaurant,
  fetchMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  // dishes
  fetchDishesByRestaurant,
  createDish,
  updateDish,
  deleteDish,
  // promotions
  fetchPromotionsByRestaurant,
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  // services
  fetchServicesByRestaurant,
  createService,
  updateService,
  deleteService,
  // selectors & actions
  selectDishCategories,
  selectMenus,
  selectDishes,
  selectPromotions,
  selectServices,
  selectAdditionStatus,
  selectAdditionError,
  clearAdditionError,
  clearAllAdditions,
} from "../redux/slices/additionRestaurantSlice";

export function useAdditionRestaurant() {
  const dispatch = useDispatch();

  const dishCategories = useSelector(selectDishCategories);
  const menus = useSelector(selectMenus);
  const dishes = useSelector(selectDishes);
  const promotions = useSelector(selectPromotions);
  const services = useSelector(selectServices);
  const status = useSelector(selectAdditionStatus);
  const error = useSelector(selectAdditionError);

  // Categories
  const loadDishCategoriesByRestaurant = useCallback(async (restaurantId) => {
    const action = await dispatch(fetchDishCategoriesByRestaurant(restaurantId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const createOneDishCategory = useCallback(async (payload) => {
    const action = await dispatch(createDishCategory(payload));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const updateOneDishCategory = useCallback(async ({ id, payload }) => {
    const action = await dispatch(updateDishCategory({ id, payload }));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const removeOneDishCategory = useCallback(async (id) => {
    const action = await dispatch(deleteDishCategory(id));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  // Menus
  const loadMenusByRestaurant = useCallback(async (restaurantId) => {
    const action = await dispatch(fetchMenusByRestaurant(restaurantId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const createOneMenu = useCallback(async (payload) => {
    const action = await dispatch(createMenu(payload));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const updateOneMenu = useCallback(async ({ id, payload }) => {
    const action = await dispatch(updateMenu({ id, payload }));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const removeOneMenu = useCallback(async (id) => {
    const action = await dispatch(deleteMenu(id));
    if (action.error) throw action.payload || action.error.message;
    return action.payload; // deleted id
  }, [dispatch]);

  const loadMenuById = useCallback(async (menuId) => {
    const action = await dispatch(fetchMenuById(menuId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  // Load menu details with dishes (alias for loadMenuById)
  const loadMenuDetails = loadMenuById;

  // Dishes
  const loadDishesByRestaurant = useCallback(async (restaurantId) => {
    const action = await dispatch(fetchDishesByRestaurant(restaurantId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const createOneDish = useCallback(async (payload) => {
    const action = await dispatch(createDish(payload));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const updateOneDish = useCallback(async ({ id, payload }) => {
    const action = await dispatch(updateDish({ id, payload }));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const removeOneDish = useCallback(async (id) => {
    const action = await dispatch(deleteDish(id));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  // Promotions
  const loadPromotionsByRestaurant = useCallback(async (restaurantId) => {
    const action = await dispatch(fetchPromotionsByRestaurant(restaurantId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const loadPromotions = useCallback(async (params) => {
    const action = await dispatch(fetchPromotions(params));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const createOnePromotion = useCallback(async (payload) => {
    const action = await dispatch(createPromotion(payload));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const updateOnePromotion = useCallback(async ({ id, payload }) => {
    const action = await dispatch(updatePromotion({ id, payload }));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const removeOnePromotion = useCallback(async (id) => {
    const action = await dispatch(deletePromotion(id));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  // Services
  const loadServicesByRestaurant = useCallback(async (restaurantId) => {
    const action = await dispatch(fetchServicesByRestaurant(restaurantId));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const createOneService = useCallback(async (payload) => {
    const action = await dispatch(createService(payload));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const updateOneService = useCallback(async ({ id, payload }) => {
    const action = await dispatch(updateService({ id, payload }));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const removeOneService = useCallback(async (id) => {
    const action = await dispatch(deleteService(id));
    if (action.error) throw action.payload || action.error.message;
    return action.payload;
  }, [dispatch]);

  const clear = useCallback(() => dispatch(clearAllAdditions()), [dispatch]);
  const clearErr = useCallback(() => dispatch(clearAdditionError()), [dispatch]);

  return {
    dishCategories,
    menus,
    dishes,
    promotions,
  services,
    status,
    error,
    // categories
    loadDishCategoriesByRestaurant,
    createOneDishCategory,
    updateOneDishCategory,
    removeOneDishCategory,
    // menus
    loadMenusByRestaurant,
    loadMenuById,
    createOneMenu,
    updateOneMenu,
    removeOneMenu,
    // dishes
    loadDishesByRestaurant,
    createOneDish,
    updateOneDish,
    removeOneDish,
    // promotions
    loadPromotionsByRestaurant,
    loadPromotions,
    createOnePromotion,
    updateOnePromotion,
    removeOnePromotion,
    // services
    loadServicesByRestaurant,
    createOneService,
    updateOneService,
    removeOneService,
    // utils
    clear,
    clearErr,
  };
}
