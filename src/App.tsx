import { useState, useEffect, useMemo } from "react";
import CloudSheet from "./components/CloudSheet";

const CACHE_KEY = "sky_simulation_cache";
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

function App() {
  const [cloudDensity, setCloudDensity] = useState(0);
  const date = new Date();
  const timeOfDay = useMemo(() => {
    return date.getHours();
  }, [date.getHours()]);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("");
  // const [shouldShowSun, setShouldShowSun] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { cloudDensity, location, timestamp } = JSON.parse(cachedData);
          const isFresh = Date.now() - timestamp < CACHE_DURATION;

          if (isFresh) {
            console.log("Loading sky data from localStorage cache...");
            setCloudDensity(cloudDensity);
            setLocationName(location);
            setLoading(false);
            return;
          }
        }

        let latitude = 19.076;
        let longitude = 72.8777;
        let cityName = "Mumbai";
        let countryName = "India";

        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          const ipData = await ipRes.json();

          if (ipData && ipData.latitude && ipData.longitude) {
            latitude = ipData.latitude;
            longitude = ipData.longitude;
            cityName = ipData.city || cityName;
            countryName = ipData.country_name || countryName;
          }
        } catch (ipError) {
          console.warn(
            "IP geolocation failed, falling back to Mumbai:",
            ipError,
          );
        }

        const finalLocation = `${cityName}, ${countryName}`;
        setLocationName(finalLocation);

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=cloud_cover`;

        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) {
          const errorText = await weatherRes.text();
          throw new Error(`API Error ${weatherRes.status}: ${errorText}`);
        }
        const weatherData = await weatherRes.json();
        console.log(weatherData);

        const current = weatherData.current;

        const cloudDensity = current.cloud_cover;

        const cachePayload = {
          cloudDensity,
          location: finalLocation,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

        setCloudDensity(cloudDensity);
        console.log("Fresh Cloud Density Fetched & Cached:", cloudDensity);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  // useEffect(() => {
  //   if (timeOfDay >= 6 && timeOfDay <= 9) {
  //     setShouldShowSun(true);
  //   } else {
  //     setShouldShowSun(false);
  //   }
  //   // else if (timeOfDay >= 18 && timeOfDay <= 19) {
  //   //   setShouldShowSun(true);
  //   // }
  // }, [timeOfDay]);

  if (loading) {
    return (
      <div>Detecting location and loading procedural sky parameters...</div>
    );
  }

  const getSkyGradient = (timeOfDay = 12): string => {
    const match = skyGradientByHour.find(
      (skyGradient) => skyGradient.hour === timeOfDay,
    );
    return match?.gradient || "#000000";
  };

  const remapedSunPosition = (timeOfDay: number): number => {
    if (timeOfDay <= 6 || timeOfDay >= 19) {
      return 0;
    }

    if (timeOfDay <= 12) {
      const fraction = timeOfDay / 6;
      return fraction * 50;
    }

    const fraction = (19 - timeOfDay) / 7;

    return fraction * 50;
  };

  // const getSunGradient = (timeOfDay = 12) => {
  //   const time = Math.max(0, Math.min(24, timeOfDay));
  //   if (time > 3 && time < 9) {
  //     return `linear-gradient(0deg, #FF6A00 ${remapedSunPosition(timeOfDay)}%, #000000 100%)`;
  //   } else if (time >= 18 && time <= 20) {
  //     return `linear-gradient(0deg, #FF6A00 ${remapedSunPosition(timeOfDay)}%, #000000 100%)`;
  //   }
  //   return "linear-gradient(0deg, #87CEEB 0%, #E0F6FF 100%)";
  // };

  const isNight =
    (timeOfDay >= 19 && timeOfDay <= 24) || (timeOfDay >= 1 && timeOfDay <= 5);

  return (
    <div
      style={{
        background: getSkyGradient(timeOfDay),
      }}
      className="w-screen h-screen overflow-hidden"
    >
      {!isNight && (
        <CloudSheet cloudDensity={cloudDensity} timeOfDay={timeOfDay} />
      )}

      {/* {shouldShowSun && (
        <div
          style={{
            background: getSunGradient(timeOfDay),
          }}
          className="absolute w-screen h-screen z-20"
        />
      )} */}

      <div className="p-6 absolute z-50 bg-white max-w-fit m-4 rounded-xl">
        <h1 className="text-xl font-bold">Procedural Sky Simulation</h1>
        <p>Location: {locationName}</p>
        {cloudDensity && (
          <ul className="mt-2 text-sm">
            <li>Cloud Density: {cloudDensity}%</li>
            <li>Time of Day: {timeOfDay}</li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;

const skyGradientByHour = [
  {
    hour: 1,
    gradient: `#000000`,
  },
  {
    hour: 2,
    gradient: `#000000`,
  },
  {
    hour: 3,
    gradient: `#000000`,
  },
  {
    hour: 4,
    gradient: `linear-gradient(180deg, #000000 0%, #001A33 70%)`,
  },
  {
    hour: 5,
    gradient: `linear-gradient(180deg, #000000 0%, #00284D 50%)`,
  },
  {
    hour: 6,
    gradient: `linear-gradient(180deg, #000000 0%, #00274C 50%, #83270080 100%)`,
  },
  {
    hour: 7,
    gradient: `linear-gradient(180deg, #004381 0%, #B78A78 100%)`,
  },
  {
    hour: 8,
    gradient: `linear-gradient(180deg, #004381 0%, #E5E5E5 100%)`,
  },
  {
    hour: 9,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 10,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 11,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 12,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 13,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 14,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 15,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 16,
    gradient: `linear-gradient(180deg, #004381 0%, #FFFFFF 100%)`,
  },
  {
    hour: 17,
    gradient: `linear-gradient(180deg, #004381 0%, #E5E5E5 100%)`,
  },
  {
    hour: 18,
    gradient: `linear-gradient(180deg, #004381 0%, #B78A78 100%)`,
  },
  {
    hour: 19,
    gradient: `linear-gradient(180deg, #000000 0%, #00274C 50%, #83270080 100%)`,
  },
  {
    hour: 20,
    gradient: `linear-gradient(180deg, #000000 0%, #00284D 50%)`,
  },
  {
    hour: 21,
    gradient: `linear-gradient(180deg, #000000 0%, #001A33 70%)`,
  },
  {
    hour: 22,
    gradient: `#000000`,
  },
  {
    hour: 23,
    gradient: `#000000`,
  },
  {
    hour: 24,
    gradient: `#000000`,
  },
];
