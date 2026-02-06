export const Button = ({ children, type = "submit", onClick, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        bg-blue-600 text-white p-2 rounded 
        hover:bg-blue-700 transition-colors 
        disabled:bg-blue-300 disabled:cursor-not-allowed
        font-medium shadow-sm active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
};