  import { useEffect, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { useApi } from "../../context/useApi";
  import {
    setRestaurants,
    setLoading,
  } from "../../store/slices/restaurantSlice";
  import RestaurantCard from "../../components/RestaurantCard";
  import Loader from "../../components/Loader";
  import { FiSearch, FiFilter } from "react-icons/fi";

  const CUISINES = ["All", "Indian", "Chinese", "Italian", "Fast Food", "South Indian", "Biryani"];

  const Home = () => {
    const dispatch = useDispatch();
    const { api }  = useApi();

    const { restaurants, loading } = useSelector((s) => s.restaurant);

    const [search,        setSearch]        = useState("");
    const [selectedCity,  setSelectedCity]  = useState("");
    const [selectedCuisine, setSelectedCuisine] = useState("All");

    const fetchRestaurants = async (city = "", cuisine = "") => {
      dispatch(setLoading(true));
      try {
        const params = {};
        if (city)                        params.city    = city;
        if (cuisine && cuisine !== "All") params.cuisine = cuisine;

        const { data } = await api.get("/restaurants/", { params });
        dispatch(setRestaurants(data));
      } catch {
        dispatch(setRestaurants([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    useEffect(() => {
      fetchRestaurants(selectedCity, selectedCuisine);
    }, [selectedCity, selectedCuisine]);

    const filtered = restaurants.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine_type.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

        {/* Hero */}
        <div className="home-hero">
          <h2>Hungry? We've got you.</h2>
          <p>Order from the best restaurants near you</p>

          <div className="search-bar">
            <FiSearch size={18} />
            <input
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="filter-left">
            <FiFilter size={16} />
            <span>Filter:</span>
          </div>

          <div className="cuisine-chips">
            {CUISINES.map((c) => (
              <button
                key={c}
                className={`chip ${selectedCuisine === c ? "chip-active" : ""}`}
                onClick={() => setSelectedCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: 160 }}>
            <input
              placeholder="Filter by city..."
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem" }}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No restaurants found.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setSelectedCity("");
                setSelectedCuisine("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">{filtered.length} restaurants found</p>
            <div className="grid-3">
              {filtered.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </>
        )}

      </div>
    );
  };

  export default Home;