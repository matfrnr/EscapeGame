import { useEffect, useState, useCallback, useRef } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";
import AvatarGroup from "./ui/AvatarGroup.jsx";
import Avatar from "./ui/Avatar.jsx";
import MoneyIndicator from "./ui/MoneyIndicator.jsx";
import Hint from "./ui/Hint.jsx";

import Button from "./ui/Button.jsx";
import { useChallenge } from "../contexts/ChallengeContext.jsx";
import { useLobby } from "../contexts/LobbyContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import Modal from "react-modal";
import { CircleX, MessageSquareMore } from "lucide-react";
import Chat from "./ui/Chat.jsx";

// Configure React Modal
Modal.setAppElement("#root");

function GlobalLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentKey } = useChallenge(); // Assurez-vous que currentKey est initialisé
  const { groupCode } = useLobby();
  const { nextStep } = useChallenge();
  const { groupMembers, groupName } = useLobby();
  const { userInfo } = useAuth();
  const location = useLocation();
  const { pathname } = location;
  // Déterminer si l'utilisateur est le leader (isLeader)
  const isLeader = groupMembers.some(
    (member) => member.role === 1 && member.id === userInfo.id,
  );

  const team = groupMembers.map(member => {
    return {
      name: member.username,
      src: member.profil_picture || 'default-profile-picture-url'
    };
  });

  const formatKey = (currentKey) => {
    const length = 12; // Longueur totale souhaitée
    const displayKey = currentKey || ""; // Utilise une chaîne vide si `currentKey` est undefined/null
    const formattedKey = displayKey.split("").join(" "); // Ajoute un espace entre les caractères existants
    const remainingSpaces = length - displayKey.length; // Nombre de tirets restants
    return formattedKey + " _".repeat(remainingSpaces).trim(); // Ajoute des tirets avec des espaces
  };

  return (
    <div
      className="relative flex h-screen flex-col"
      style={{ height: "100dvh" }} // Ensure dynamic viewport height is respected
    >
      <main
        className="absolute inset-0 flex-grow overflow-y-auto p-4 pb-32 pt-20"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <Outlet />
      </main>
      <header
        className="relative z-10 flex flex-shrink-0 items-start justify-between p-4"
        style={{
          WebkitOverflowScrolling: "touch",
          background:
            "linear-gradient(to bottom, rgb(38, 38, 38) 0%, rgba(38, 38, 38, 0) 100%)",
        }}
      >
        <div className="mr-4 flex items-center gap-3">
          <AvatarGroup groupName={groupName}>
            {team.map((member, index) => {
              return <Avatar key={index} src={member.src} name={member.name} />;
            })}
          </AvatarGroup>
        </div>

        <div className="flex items-center gap-2">
          <MoneyIndicator/>
          {/* Ouvre le modal */}
          <Button className="rounded-full" onClick={() => setIsChatOpen(true)} disabled={pathname === "/challenge/12" || pathname === "/challenge/9"}>
            <MessageSquareMore size={18} />
          </Button>
        </div>
      </header>
      {/* Gradient overlay under header */}
      <div
        className="fixed left-0 right-0 top-0 z-[-1] h-24"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      <footer
          className="fixed bottom-0 left-0 right-0 z-10 flex-shrink-0 p-3"
          style={{
            background: "linear-gradient(to top, rgb(38, 38, 38) 0%, rgba(38, 38, 38, 0) 100%)",
          }}
      >
        <div className="space-y-4 rounded-xl bg-neutral-700 p-3">
          <div className="grid grid-cols-3 gap-2">
            <Hint level={1} hintId="hint1" cost={1}/>
            <Hint level={2} hintId="hint2" cost={2}/>
            <Hint level={3} hintId="hint3" cost={3}/>
          </div>
          <p className="text-center text-lg font-normal text-white">{formatKey(currentKey)}</p>
        </div>
      </footer>

      {/*{isLeader && pathname !== "/ending" && (*/}
      {/*    <button*/}
      {/*        onClick={nextStep}*/}
      {/*        className="fixed bottom-4 right-4 z-10 rounded-full bg-primary p-4 text-white"*/}
      {/*    >*/}
      {/*      Next*/}
      {/*    </button>*/}
      {/*)}*/}

      {/* Modal pour afficher le chat */}
      <Modal
          isOpen={isChatOpen}
          onRequestClose={() => setIsChatOpen(false)}
          className="relative mx-auto mt-12 h-[80vh] max-w-4xl overflow-hidden rounded-lg bg-gray-800 shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <button
          onClick={() => setIsChatOpen(false)}
          className="absolute right-4 top-4 rounded-full bg-background p-2 text-white"
        >
          <CircleX />
        </button>
        {/* Chat Component */}
        <div className="h-full">
          <Chat groupCode={groupCode} />
        </div>
      </Modal>
    </div>
  );
}

export default GlobalLayout;
