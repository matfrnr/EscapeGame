import { useEffect, useState, useCallback, useRef } from "react";
import coin from "../../assets/images/coin.png";
import { useGameContext } from "../../contexts/GameContext.jsx"; // Assurez-vous d'importer le contexte

function MoneyIndicator() {
    const { money, deductMoney } = useGameContext();
    const [displayMoney, setDisplayMoney] = useState(money);
    const moneyRef = useRef(money); // Référence pour stocker la valeur actuelle de l'argent et éviter des rendus inutiles

    // Synchroniser `displayMoney` avec `money` lors de changements majeurs
    useEffect(() => {
        if (moneyRef.current !== money) {
            setDisplayMoney(money); // Mettre à jour `displayMoney` seulement si `money` a changé
            moneyRef.current = money; // Synchroniser la référence
        }
    }, [money]);

    // Conversion de l'argent avec un espace pour séparer les milliers si nécessaire
    const formattedAmount = displayMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return (
        <div className="flex w-fit items-center gap-2 rounded-full bg-neutral-700 px-4 py-2 h-fit whitespace-nowrap">
            <p className="truncate">{formattedAmount}</p>
            <img src={coin} alt="coin" className="w-5"/>
        </div>
    );
}

export default MoneyIndicator;
