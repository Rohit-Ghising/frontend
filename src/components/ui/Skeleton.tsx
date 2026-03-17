export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-56 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton w-16" />
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-4 skeleton w-1/3" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="h-96 skeleton rounded-2xl" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-6 skeleton w-2/3" />
        <div className="h-10 skeleton w-1/2" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-5/6" />
        <div className="h-12 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 skeleton rounded" />
        </td>
      ))}
    </tr>
  );
}
