export function Footer() {
    return (
        <footer className="border-t border-border mt-18">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-muted">
                <span>© {new Date().getFullYear()} mrkt. All rights reserved.</span>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-text transition-colors">Help</a>
                    <a href="#" className="hover:text-text transition-colors">Shipping</a>
                    <a href="#" className="hover:text-text transition-colors">Returns</a>
                </div>
            </div>
        </footer>
    );
}