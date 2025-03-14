function AdepteChallengeCard({ adepteOf }) {
  return (
    <div className="w-full rounded-lg bg-neutral-700 p-4 text-center mb-4">
      <h3>Epreuve d&apos;adepte :</h3>
      <p className="text-2xl uppercase text-primary">{adepteOf}</p>
    </div>
  );
}

export default AdepteChallengeCard;
