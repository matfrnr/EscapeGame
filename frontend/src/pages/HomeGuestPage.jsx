import { useState } from "react";
import axios from "axios";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button"; // Votre composant Button
import TextInput from "../components/ui/TextInput";
import "../../styles/home.css";
import "../assets/styles/timer.css";
import logo from "../assets/images/logo.png";

const HomeGuestPage = () => {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    profil_picture: null
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Modal d'inscription
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFileName(""); // Réinitialiser le nom du fichier sélectionné
  };

  // Fonction de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      setLoginErrorMessage("Nom d'utilisateur et mot de passe sont requis");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/login", loginData);
      setLoginErrorMessage("");

      if (response.data && response.data.user) {
        const { id, username, profil_picture } = response.data.user;
        setIsAuthenticated(true, { id, username, profil_picture });
        navigate("/dashboard");
      } else {
        setLoginErrorMessage("Erreur lors de la connexion");
      }
    } catch (err) {
      setLoginErrorMessage(err.response?.data?.error || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.username || !registerData.password) {
      setRegisterErrorMessage("Nom d'utilisateur et mot de passe sont requis");
      return;
    }

    const formData = new FormData();
    formData.append("password", registerData.password);
    formData.append("profil_picture", registerData.profil_picture);

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/auth/register/${registerData.username}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 201) {
        const loginResponse = await axios.post("/api/auth/login", {
          username: registerData.username,
          password: registerData.password
        });

        if (loginResponse.data && loginResponse.data.user) {
          const { id, username, profil_picture } = loginResponse.data.user;
          setIsAuthenticated(true, { id, username, profil_picture });
          closeModal();
          navigate("/dashboard");
        } else {
          setRegisterErrorMessage("Erreur lors de la connexion après inscription");
        }
      } else {
        setRegisterErrorMessage("Erreur lors de l'inscription");
      }
    } catch (err) {
      setRegisterErrorMessage(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-6 space-y-8">

        <h1 className="text-3xl font-bold text-center text-primary">
            Il faut sauver le <br /> BDE MMI
        </h1>

        <div className="home-guest-logo">
            <img src={logo} alt="Logo" className="logo" />
        </div>

        <form className="home-guest-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
                <label htmlFor="login-username" className="form-label">Username</label>
                <TextInput
                  id="login-username"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
            </div>
            <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <TextInput
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
            </div>
            <Button
              type="button"
              onClick={(e) => {
                  e.preventDefault();
                  handleLogin(e);
              }}
              disabled={isLoading}
              variant="default"
              size="default"
            >
                {isLoading ? "Chargement..." : "Connexion"}
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                  e.preventDefault();
                  openModal();
              }}
              //disabled="true"
              variant="outline"
              size="default"
            >
                Inscription
            </Button>

            {/* Affichage du message d'erreur de connexion */}
            {loginErrorMessage && (
              <div className="error-message">{loginErrorMessage}</div>
            )}
        </form>

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          center
          closeOnOverlayClick={true}
          showCloseIcon={false}
          classNames={{
              overlay: "modal-overlay-custom",
              modal: "modal-custom bg-background bg-opacity-90 border border-primary shadow-lg"
          }}
        >
            <h2 className="modal-title-custom text-23xl text-primary">Inscription</h2>
            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <div className="modal-form-group">
                    <label htmlFor="register-username" className="modal-form-label">Username</label>
                    <TextInput
                      id="register-username"
                      placeholder="Username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className=""
                    />
                </div>
                <div className="modal-form-group">
                    <label htmlFor="register-password" className="modal-form-label">Password</label>
                    <TextInput
                      id="register-password"
                      type="password"
                      placeholder="Password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className=""
                    />
                </div>
                <div className="modal-form-group">
                    <label htmlFor="register-profile-picture" className="modal-form-label">Photo de Profil</label>
                    <input
                      type="file"
                      id="register-profile-picture"
                      style={{ display: "none" }}
                      onChange={(e) => {
                          setRegisterData({ ...registerData, profil_picture: e.target.files[0] });
                          setSelectedFileName(e.target.files[0]?.name || "");
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("register-profile-picture").click()}
                      variant="outline"
                      size="default"
                    >
                        Choisir une photo
                    </Button>
                    {selectedFileName && (
                      <p className="italic mt-2">{selectedFileName}</p>
                    )}
                </div>

                {registerErrorMessage && (
                  <div className="modal-error-message text-red-500">
                      {registerErrorMessage}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={(e) => {
                      e.preventDefault();
                      handleRegister(e);
                  }}
                  disabled={isLoading}
                  variant="default"
                  size="default"
                >
                    {isLoading ? "Chargement..." : "Inscription"}
                </Button>
            </form>
        </Modal>
    </div>
  );
};

export default HomeGuestPage;