import { useGameContext } from "../../contexts/GameContext.jsx";
import { cn } from "../../utils/utils.jsx";

function Hint({ level, hintId, cost }) {
  const {
    money,
    deductMoney,
    usedHints,
    addUsedHint,
    currentChallenge,
    hints,
  } = useGameContext();

  const hintKey = `${currentChallenge}-${hintId}`;
  const isDisabled = usedHints.includes(hintKey) || money < cost;
  const hintNames = ["Faible", "Moyen", "Fort"];
  const costSymbols = ["€", "€€", "€€€"];

  const handleClick = () => {
    if (isDisabled) return;

    // Affiche l'indice
    alert(`Indice : ${hints[currentChallenge][hintId]}`);

    // Déduit l'argent et marque l'indice comme utilisé
    //deductMoney(cost);
    addUsedHint(hintKey, cost);
  };
  return (
      <button
          onClick={handleClick}
          disabled={isDisabled}
          className={cn(
              "flex items-center gap-2 rounded-full bg-primary px-1 py-1 text-xs w-full sm:text-sm md:text-base shrink-0",
              isDisabled && "cursor-not-allowed opacity-50"
          )}
      >
        <div className="flex items-center justify-center gap-1 rounded-full bg-[#292929] p-1 w-10 h-10 sm:w-12 sm:h-12">
              <span className="text-xs sm:text-base md:text-lg">
                {costSymbols[level - 1]}
              </span>
        </div>

        <p className="text-xs sm:text-sm md:text-base truncate">
          {
            hintNames[level - 1]
          }
        </p>
      </button>
  );
}

export default Hint;