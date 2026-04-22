import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";

export function TicketClassGrid({ ticketClasses }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-red-50 mt-8">
      <MiniHeader title={"Các hạng vé"} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {ticketClasses.map(item => (
          <div 
            className="flex justify-between items-center p-5 border border-gray-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all bg-gray-50 hover:bg-white cursor-pointer group" 
            key={item.ticketClassId}
          >
            <div className="flex-1 pr-4">
              <p className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{item.className}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
             
            <div className="text-right pl-4 border-l border-gray-200">
              <p className="text-xl md:text-2xl font-extrabold text-red-600 whitespace-nowrap">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}