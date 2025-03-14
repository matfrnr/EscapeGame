import QRProgress from "../../components/ui/QRProgress.jsx";
import Scanner from "../../components/ui/Scanner.jsx";
import AdepteChallengeCard from "../../components/ui/AdepteChallengeCard.jsx";
import Hint from "../../components/ui/Hint.jsx";
import Select from "../../components/ui/Select.jsx";

const LesComposant = () => {
  return (
    <div className="max-w-56">
      <QRProgress current={3} />
      <Scanner />
      <div className="max-w-80">
        <AdepteChallengeCard adepteOf="Jacquot" />
      </div>
      <div className="flex items-center gap-2">
        <Hint level={1} />
        <Hint level={2} />
        <Hint level={3} />
      </div>
      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
        ]}
      />
    </div>
  );
}

export default LesComposant;