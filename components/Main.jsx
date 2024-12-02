import React, { useState, useEffect } from "react";

const Main = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [moviedata, setMoviedata] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);
    const API_KEY = "9918bb89";


    const fetchMovies = async (query) => {
        if (!query) {
            setMoviedata([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.Response === "True") {
                const detailedMovies = await Promise.all(
                    data.Search.map(async (movie) => {
                        const detailsResponse = await fetch(
                            `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`
                        );
                        const details = await detailsResponse.json();
                        return { ...movie, Plot: details.Plot, Rating: details.imdbRating };
                    })
                );
                setMoviedata(detailedMovies);
            } else {
                setError(data.Error);
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMovies(searchTerm);
        });
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
    return (
        <div className="container mx-auto p-6 min-h-screen flex flex-col items-center bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">
                Movie Search App
            </h1>
            <div className="flex w-full max-w-3xl mb-8">
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-4 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
            </div>
            {loading && <p className="text-lg text-center text-gray-500">Loading...</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moviedata.map((movie) => (
                    <div
                        key={movie.imdbID}
                        className="bg-white border shadow-lg rounded-lg overflow-hidden"
                    >
                        {movie.Poster !== "N/A" && (
                            <img
                                src={movie.Poster}
                                alt={movie.Title}
                                className="w-full h-76 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-800">{movie.Title}</h3>
                            <p className="text-sm text-gray-600">Year: {movie.Year}</p>
                            <p className="text-sm text-gray-600">Rating: {movie.Rating || "N/A"}</p>
                            <p className="text-sm text-gray-800 mt-2">
                                {movie.Plot || "No plot available."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && moviedata.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-10">No movies found. Try searching!</p>
            )}
        </div>
    );
};

export default Main;
