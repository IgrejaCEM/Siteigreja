import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function EventCarousel({ events = [] }) {
  const navigate = useNavigate();

  if (!events.length) {
    return (
      <div style={{ background: "#111", color: "#b39ddb", borderRadius: 24, padding: 48, textAlign: "center", fontWeight: "bold", fontSize: "1.5em", margin: "32px 0" }}>
        Nenhum evento cadastrado.
      </div>
    );
  }

  return (
    <div style={{ background: "#000", borderRadius: 32, padding: 32, maxWidth: 600, margin: "40px auto" }}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={32}
        slidesPerView={1}
        style={{ minHeight: 420 }}
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <div
              style={{
                background: "#181818",
                border: "3px solid #6a1b9a",
                borderRadius: 24,
                boxShadow: "0 2px 16px #0008",
                overflow: "hidden",
                cursor: "pointer",
                transition: "box-shadow .2s, border .2s",
                maxWidth: 420,
                margin: "0 auto"
              }}
              onClick={() => navigate(`/evento/${event.slug || event.id}`)}
            >
              <img
                src={event.banner || "/images_site/banner-home.png"}
                alt={event.title}
                style={{ width: "100%", height: 260, objectFit: "cover", borderBottom: "2px solid #6a1b9a" }}
              />
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: "2em", fontWeight: "bold", color: "#7fff7f", marginBottom: 8, textShadow: "1px 1px 2px #000" }}>
                  {event.title}
                </div>
                <div style={{ color: "#fff", fontSize: "1.1em", marginBottom: 8 }}>
                  <span role="img" aria-label="local">📍</span> {event.location || "Local não informado"}
                </div>
                <div style={{ color: "#b39ddb", fontSize: "1em" }}>
                  <span role="img" aria-label="data">📅</span> {event.date ? new Date(event.date).toLocaleDateString() : "Data não informada"}
                </div>
                {event.duration && (
                  <div style={{ color: "#7fff7f", fontSize: "1em", marginTop: 4 }}>
                    <span role="img" aria-label="duração">⏱️</span> {event.duration}
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 