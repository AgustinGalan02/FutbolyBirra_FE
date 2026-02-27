function Footer() {

  return (
    <footer className="border-t border-zinc-700 bg-zinc-800/50 text-zinc-400 p-3 w-full">
      <div className="text-center pt-4 text-[10px] text-zinc-600 uppercase tracking-widest">
        © {new Date().getFullYear()} Fútbol y Birra - Argentina
      </div>
    </footer>
  );
}

export default Footer;