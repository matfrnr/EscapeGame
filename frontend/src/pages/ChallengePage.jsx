import { useChallenge } from '../contexts/ChallengeContext';
import { lazy, Suspense, useEffect } from 'react';

const ChallengePage = () => {
    const { currentStep } = useChallenge();

    const renderChallengeStepComponent = () => {
        const ChallengeComponent = lazy(() => import(`../components/challenge/${currentStep}.jsx`));
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <ChallengeComponent />
            </Suspense>
        );
    };

    return (
        <div>
            {/*<div>Key: {revealedKey}</div>*/}
            {/*<div>Money: {money}</div>*/}
            {/*<button onClick={buyHint} disabled={money < 100}>Buy Hint</button>*/}
            {renderChallengeStepComponent()}
        </div>
    );
};

export default ChallengePage;