import { MarkaTestForm } from "@/components/marka/MarkaTestForm";

export default function MarkaTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Marka API Test</h1>
        <p className="text-gray-600 mt-2">Backend integratsiya testlari</p>
      </div>
      
      <MarkaTestForm />
    </div>
  );
}