import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../../hooks/useData.js";
import "./CreateEventPage.css";
import { Step1BasicInfo } from "./components/Step1BasicInfo.jsx";
import { Step2TicketClasses } from "./components/Step2TicketClasses.jsx";
import { Step3SeatLayout } from "./components/Step3SeatLayout.jsx";

const STEP_META = [
  {
    number: 1,
    eyebrow: "BƯỚC 1",
    title: "Thông tin cơ bản",
    description: "Nhập thông tin chung, thời gian, địa điểm và ảnh bìa cho sự kiện.",
  },
  {
    number: 2,
    eyebrow: "BƯỚC 2",
    title: "Hạng vé và giá bán",
    description: "Tạo danh sách hạng vé, loại vé, màu hiển thị, số lượng và mức giá bán.",
  },
  {
    number: 3,
    eyebrow: "BƯỚC 3",
    title: "Sơ đồ chỗ ngồi",
    description: "Gán hạng vé vào từng khu vực và lưu sơ đồ chỗ ngồi đúng format backend.",
  },
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { refreshEvents } = useData();

  const [currentStep, setCurrentStep] = useState(1);
  const [eventId, setEventId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentMeta = useMemo(
    () => STEP_META.find((step) => step.number === currentStep) ?? STEP_META[0],
    [currentStep]
  );

  const handleBasicInfoDone = (newEventId) => {
    setEventId(newEventId);
    setCurrentStep(2);
    setIsCompleted(false);
  };

  const handleTicketClassesDone = () => {
    setCurrentStep(3);
  };

  const handleWizardDone = async () => {
    setIsCompleted(true);
    try {
      await refreshEvents();
    } catch {
      // Không chặn UI
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setEventId(null);
    setIsCompleted(false);
  };

  return (
    <main className="create-event-page">
      <div className="create-event-shell">
        <section className="create-event-header">
          <div>
            <p className="create-event-header__eyebrow">KHU VỰC NHÀ TỔ CHỨC</p>
            <h1 className="create-event-header__title">Tạo sự kiện</h1>
            <p className="create-event-header__desc">
              Hoàn tất 3 bước theo đúng API backend hiện tại.
            </p>
          </div>

          <div className="create-event-header__actions">
            {eventId ? (
              <span className="create-event-badge">Mã sự kiện: #{eventId}</span>
            ) : null}
            <button
              type="button"
              className="create-event-button create-event-button--ghost"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
          </div>
        </section>

        <section className="create-event-progress" aria-label="Tiến độ tạo sự kiện">
          {STEP_META.map((step) => {
            const isActive = step.number === currentStep;
            const isDone = step.number < currentStep || (isCompleted && step.number === 3);

            return (
              <div
                key={step.number}
                className={`create-event-progress__item${isActive ? " is-active" : ""}${
                  isDone ? " is-done" : ""
                }`}
              >
                <div className="create-event-progress__circle">{step.number}</div>
                <div className="create-event-progress__text">
                  <p>{step.eyebrow}</p>
                  <strong>{step.title}</strong>
                </div>
              </div>
            );
          })}
        </section>

        {isCompleted ? (
          <section className="create-event-card create-event-success">
            <span className="create-event-success__icon">✓</span>
            <h2>Tạo sự kiện thành công</h2>
            <p>
              Bạn đã hoàn tất đủ 3 bước cho sự kiện <strong>#{eventId}</strong>.
            </p>
            <div className="create-event-success__actions">
              <button
                type="button"
                className="create-event-button create-event-button--secondary"
                onClick={handleStartOver}
              >
                Tạo sự kiện khác
              </button>
              <button
                type="button"
                className="create-event-button"
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </button>
            </div>
          </section>
        ) : (
          <section className="create-event-card">
            <div className="create-event-card__intro">
              <div>
                <p className="create-event-card__step-label">Tạo sự kiện - Bước {currentStep}</p>
                <h2>{currentMeta.title}</h2>
                <p>{currentMeta.description}</p>
              </div>
            </div>

            {currentStep === 1 ? <Step1BasicInfo onDone={handleBasicInfoDone} /> : null}

            {currentStep === 2 ? (
              <Step2TicketClasses
                eventId={eventId}
                onDone={handleTicketClassesDone}
                onBack={() => setCurrentStep(1)}
              />
            ) : null}

            {currentStep === 3 ? (
              <Step3SeatLayout
                eventId={eventId}
                onDone={handleWizardDone}
                onBack={() => setCurrentStep(2)}
              />
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
};