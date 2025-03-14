import {useGameContext} from "../../contexts/GameContext.jsx";
const deductedMoney = ()  => {
    const { deductMoney } = useGameContext(); // Accès au hook du GameProvider
    deductMoney(2);

}

export default deductedMoney;
