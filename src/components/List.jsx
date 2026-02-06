export const List = ({ items, renderItem, isLoading, emptyMessage = "No hay elementos para mostrar" }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return <p className="text-zinc-400 text-center p-5">{emptyMessage}</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            {items.map((item, index) => renderItem(item, index))}
        </div>
    );
};