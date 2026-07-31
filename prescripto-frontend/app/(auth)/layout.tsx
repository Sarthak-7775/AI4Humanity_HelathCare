import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[350px] gap-6">
          {children}
        </div>
      </div>
      <div className="hidden bg-slate-900 lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
          alt="Healthcare professional"
          fill
          className="h-full w-full object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/20" />
        <div className="absolute bottom-12 left-12 text-white max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Prescripto
          </h1>
          <p className="text-lg text-slate-200">
            Intelligent healthcare management for the modern era. Experience seamless triage, appointment booking, and patient care.
          </p>
        </div>
      </div>
    </div>
  );
}
