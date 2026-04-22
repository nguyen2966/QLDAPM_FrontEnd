import { MiniHeader } from "../MiniHeader/MiniHeader.jsx";

export function DetailGrid({ description, mapUrl }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      
      {/* Khối mô tả */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-red-50">
        <MiniHeader title="Mô tả sự kiện" />
        <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px] md:text-base mt-4">
          {description}
        </div>
      </div>

      {/* Khối địa điểm */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-red-50 flex flex-col">
        <MiniHeader title="Địa điểm" />
        
        {/* SVG Illustration thay cho ảnh gg-map.webp cũ */}
        <div className="flex-1 bg-red-50 rounded-xl flex items-center justify-center p-8 mb-6 mt-4 text-red-200 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
        </div>
        
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-3.5 px-4 rounded-xl transition duration-300"
        >
          Xem trên Google Maps  
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        </a>
      </div>

    </div>
  );
}