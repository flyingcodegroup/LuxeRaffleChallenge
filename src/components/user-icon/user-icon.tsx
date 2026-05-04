export const UserIcon = ({ firstName }: { firstName: string }) => (
  <div className="bg-slate-400 hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-white cursor-pointer">
    {firstName[0]}
  </div>
);
