export const Button = ({ children, type = "submit", onClick, className = "" }) => { 
  return (
    <button
      type={type}
      onClick={onClick}
      className={` // estilos Tailwind + personalizados
        bg-[#f0ac00] text-white p-2 rounded // color dorado, texto blanco, padding, bordes redondeados
        hover:bg-blue-700 transition-colors // azul al pasar el mouse
        disabled:bg-blue-300 disabled:cursor-not-allowed // deshabilitado: gris + cursor bloqueado
        font-medium shadow-sm active:scale-95 // texto semi-bold, sombra, efecto de click
        ${className} // permite añadir clases personalizadas
      `}
    >
      {children}
    </button>
  );
};