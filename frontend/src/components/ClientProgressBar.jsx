export default function ClientProgressBar({ currentStep }) {
  const steps = [
    { id: 1, label: "Intake" },
    { id: 2, label: "Claims" },
    { id: 3, label: "Evidence" },
    { id: 4, label: "Follow-Up" },
  ];

  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-8 py-6 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold tracking-wide text-[#161117] uppercase">
          Case Progress
        </h3>
        <span className="text-sm font-semibold text-[#D78FEE]">
          Step {currentStep} of 4
        </span>
      </div>

      <div className="relative">
        {/* Base line */}
        <div className="absolute top-5 left-0 w-full h-[4px] bg-[#F1F1F1] rounded-full" />

        {/* Active line */}
        <div
          className="absolute top-5 left-0 h-[4px] bg-[#D78FEE] rounded-full transition-all"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />

        <div className="flex justify-between relative z-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center w-1/4">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all
                  ${
                    step.id < currentStep
                      ? "bg-[#161117] text-white"
                      : step.id === currentStep
                      ? "bg-[#D78FEE] text-[#161117] ring-4 ring-[#F6E9FB]"
                      : "bg-white border border-[#E5E7EB] text-[#9CA3AF]"
                  }`}
              >
                {step.id}
              </div>
              <span className="mt-3 text-sm font-semibold text-[#161117]">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
