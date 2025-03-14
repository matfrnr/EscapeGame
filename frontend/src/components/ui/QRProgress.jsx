function QRProgress({ length = 5, current }) {
  return (
    <div className="flex items-center justify-between gap-4 mt-8"> {/* Ajoutez gap-2 pour espacer les carrés */}
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className={`h-5 w-5 rounded-sm bg-${index < current ? "green" : "stone"}-500`}
        />
      ))}
    </div>
  );
}

export default QRProgress;