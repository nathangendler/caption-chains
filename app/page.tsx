import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { loadChains } from "@/lib/chains/data";
import { ChainForm } from "@/components/ChainForm";

export default async function ChainsPage() {
  await requireSuperadmin();
  const chains = await loadChains();
  const totalWeight = chains.filter((c) => c.is_active).reduce((sum, c) => sum + c.mix_weight, 0);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Prompt chains ({chains.length})</h1>
        <p className="mt-1 text-sm text-muted">
          A chain is an ordered list of prompt steps. Each step can read the photo and the previous step&apos;s output.
          Open one to edit its steps, reorder them, and generate from a photo.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-semibold">Name</th>
            <th className="py-2 pr-4 font-semibold">Description</th>
            <th className="py-2 pr-4 font-semibold">Steps</th>
            <th className="py-2 pr-4 font-semibold">Media</th>
            <th className="py-2 pr-4 font-semibold">Active</th>
            <th className="py-2 pr-4 font-semibold">Share of app traffic</th>
          </tr>
        </thead>
        <tbody>
          {chains.map((chain) => (
            <tr key={chain.id} className="border-b border-line">
              <td className="py-2 pr-4">
                <Link href={`/chains/${chain.id}`} className="font-semibold underline">
                  {chain.name}
                </Link>
              </td>
              <td className="py-2 pr-4 text-muted">{chain.description}</td>
              <td className="py-2 pr-4">{chain.stepCount}</td>
              <td className="py-2 pr-4">{chain.mediaCount}</td>
              <td className="py-2 pr-4">{chain.is_active ? "yes" : "no"}</td>
              <td className="py-2 pr-4">
                {chain.is_active && totalWeight > 0 ? `${Math.round((chain.mix_weight / totalWeight) * 100)}%` : "–"}
              </td>
            </tr>
          ))}
          {chains.length === 0 && (
            <tr>
              <td colSpan={6} className="py-3 text-muted">
                No chains yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <section className="panel flex flex-col gap-3 p-4">
        <h2 className="text-lg font-semibold">New chain</h2>
        <ChainForm chain={null} />
      </section>
    </main>
  );
}
