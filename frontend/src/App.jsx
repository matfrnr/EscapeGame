import {useEffect, useState} from "react";
import {CountdownProvider} from "./contexts/CountdownContext";
import {AuthProvider} from "./contexts/AuthContext";
import {LobbyProvider} from "./contexts/LobbyContext";
import {ChallengeProvider} from "./contexts/ChallengeContext";
import {KeyProvider} from "./contexts/KeyContext.jsx";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomeGuestPage from "./pages/HomeGuestPage";
import Countdown from "./components/Countdown";
import DashboardPage from "./pages/DashboardPage";
import GlobalRedirect from "./utils/GlobalRedirect";
import LobbyPage from "./pages/LobbyPage.jsx";
import ChallengePage from "./pages/ChallengePage.jsx";
import IntroHome from "./pages/IntroHome.jsx";

//Css
import "../styles/globals.css";
import "./App.css";

//Gif
import MyBeloved from "./assets/images/mybeloved.gif";
import ChatPage from "./pages/ChatPage.jsx";
import GlobalLayout from "./components/GlobalLayout.jsx";
import {GameProvider} from "./contexts/GameContext.jsx";
import Scoreboard from "./components/challenge/Scoreboard.jsx";
import EndingGame from "./components/challenge/endingGame.jsx";
import Modal from "react-modal";
import NextChallenge from "./components/challenge/NextChallenge.jsx";

Modal.setAppElement("#root");

const App = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Vérification si l'appareil est un mobile ou une tablette
        const checkDevice = () => {
            const userAgent = navigator.userAgent;
            const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(
                userAgent,
            );
            setIsMobile(isMobileDevice);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice); // Actualise en cas de redimensionnement
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    if (!isMobile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold">
                    Le jeu n&#39;est disponible que sur téléphone ou tablette.
                </p>
                <br/>
                <p className="text-md">
                    Merci de recharger la page sur un appareil mobile.
                </p>
                <br/>
                <img src={MyBeloved} alt="My Beloved" className="w-62 h-62 mt-4"/>
            </div>
        );
    }

    return (
        <CountdownProvider>
            <AuthProvider>
                <LobbyProvider>
                    <ChallengeProvider>
                        <GameProvider>
                            <KeyProvider>
                                <Router>
                                    <Routes>
                                    <Route path="/rules" element={<IntroHome/>}/>
                                        <Route path="/scoreboard" element={<Scoreboard/>}/>
                                        <Route path="/chat/:code" element={<ChatPage/>}/>
                                        {/* Toutes les routes passent par GlobalRedirect */}
                                        <Route path="*" element={<GlobalRedirect/>}>
                                            <Route path="countdown" element={<Countdown/>}/>
                                            <Route path="home" element={<HomeGuestPage/>}/>
                                            <Route path="dashboard" element={<DashboardPage/>}/>
                                            <Route path="lobby" element={<LobbyPage/>}/>
                                            <Route element={<GlobalLayout/>}>
                                                <Route
                                                    path="challenge/:step"
                                                    element={<ChallengePage/>}
                                                />
                                                <Route path="challenge/:step/next" element={<NextChallenge />} />
                                            </Route>
                                        </Route>
                                        <Route element={<GlobalLayout/>}>
                                            <Route path="ending" element={<EndingGame/>}/>
                                        </Route>
                                    </Routes>
                                </Router>
                            </KeyProvider>
                        </GameProvider>
                    </ChallengeProvider>
                </LobbyProvider>
            </AuthProvider>
        </CountdownProvider>
    );
};

export default App;
