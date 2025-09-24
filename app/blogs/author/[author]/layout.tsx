export default function AuthorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen">
            <main className="container mx-auto">{children}</main>
        </div>
    )
}
