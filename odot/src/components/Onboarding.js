import React from "react";
import { useNavigate } from "react-router-dom";
import imgStats from "../images/screentimeusage.PNG";
import imgNotes from "../images/notesandgoals.PNG";
import imgTodos from "../images/todos.PNG";
import imgArrow from "../images/arrow.PNG";

function Onboarding() {
  const navigate = useNavigate();

  const options = [
    { key: "dashboard", img: imgStats },
    { key: "notesGoalsUI", img: imgNotes },
    { key: "todos", img: imgTodos },
  ];

  return (
    <div className="onboard-body" style={{ position: "relative" }}>
      <p onClick={() => navigate("/")} className="navButton">
        ← Back
      </p>

      <div className="zigzag-container" style={{ position: "relative" }}>
        {options.map((opt, index) => (
          <div
            key={opt.key}
            className={`zigzag-item ${index % 2 === 0 ? "left" : "right"}`}
            onClick={() => navigate(`/${opt.key}`)}
            style={{ marginBottom: "0px", position: "relative" }}
          >
            <img src={opt.img} alt={opt.key} className="zigzag-img" />
          </div>
        ))}

        {/* Single arrow positioned absolutely along the side */}
        <img
          src={imgArrow}
          alt="arrow"
          style={{
            position: "absolute",
            top: 0,
            right: "-30px", // adjust distance from buttons
            height: "100%", // stretch along the container
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export default Onboarding;

