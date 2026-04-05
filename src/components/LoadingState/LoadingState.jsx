export function LoadingState( {displayText} ){
  return (
    <div className="loading-state">
        <div className="spinner" />
        <span>{displayText}</span>
    </div>
  )
}