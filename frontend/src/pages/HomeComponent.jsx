import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import SendIcon from "@mui/icons-material/Send";
import "../utils/HomeComponent.css";
import { AuthContext } from "../contexts/Authcontext";

const HomeComponent = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const { addUserHistory } = useContext(AuthContext);

  let routeTo = useNavigate();

  let joinVideoCall = async () => {
    await addUserHistory(meetingCode);
    window.location.href = `${meetingCode}`;
    // routeTo();
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          {/* <Navbar.Brand href="#home">Connectly</Navbar.Brand> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="me-auto">
              <IconButton>
                <p style={{ margin: 0 }}>
                  <RestoreIcon></RestoreIcon> History
                </p>
              </IconButton>
              <IconButton
                onClick={() => {
                  localStorage.removeItem("token");
                  routeTo("/auth");
                }}
              >
                Logout
              </IconButton>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="meetingContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education</h2>
          </div>
          <div className="totalMessageInput">
          <div
            style={{ display: "flex", gap: "10px" }}
            className="meetingInput"
          >
            <TextField
              id="outlined-basic"
              label="meeting code"
              variant="outlined"
              onChange={(e) => setMeetingCode(e.target.value)}
            ></TextField>
            <IconButton onClick={joinVideoCall}>
              <SendIcon></SendIcon>
            </IconButton>
          </div>
        </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo2.svg" className="responsive-img" />
        </div>
      </div>
    </>
  );
};

export default withAuth(HomeComponent);
