import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Chào mừng đến với <span className="highlight">CARO GAME</span>
            </h1>
            <p className="hero-subtitle">
              Trò chơi cờ caro trực tuyến nhiều người chơi
            </p>
            <p className="hero-description">
              Thách đấu với bạn bè, tạo phòng riêng hoặc tham gia phòng công
              khai. Trải nghiệm gameplay mượt mà với giao diện đẹp mắt và tính
              năng realtime.
            </p>
            <div className="hero-buttons">
              <Link to="/lobby" className="btn btn-primary">
                Bắt đầu chơi
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Đăng ký ngay
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="game-board-preview">
              <div className="board-grid">
                {Array.from({ length: 49 }).map((_, index) => (
                  <div key={index} className="grid-cell">
                    {index === 24 && <div className="stone black"></div>}
                    {index === 25 && <div className="stone white"></div>}
                    {index === 31 && <div className="stone black"></div>}
                    {index === 32 && <div className="stone white"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Chơi Realtime</h3>
              <p>Đồng bộ nước đi tức thì, không bị lag hay delay</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Phòng riêng tư</h3>
              <p>Tạo phòng chơi riêng với mã mời để chơi cùng bạn bè</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Nhiều người chơi</h3>
              <p>Tham gia phòng công khai hoặc mời bạn bè vào phòng</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Chat trong game</h3>
              <p>Trò chuyện với đối thủ trong khi chơi</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Lịch sử trận đấu</h3>
              <p>Xem lại các trận đã chơi và phân tích nước đi</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Kết bạn</h3>
              <p>Thêm bạn bè và mời họ chơi cùng bất cứ lúc nào</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="how-to-play-section">
        <div className="container">
          <h2 className="section-title">Cách chơi</h2>
          <div className="rules-content">
            <div className="rules-text">
              <div className="rule-item">
                <h3>Mục tiêu</h3>
                <p>
                  Tạo ra một đường thẳng 5 quân cờ liên tiếp theo hàng ngang,
                  hàng dọc hoặc đường chéo
                </p>
              </div>
              <div className="rule-item">
                <h3>Luật chơi</h3>
                <p>
                  Người chơi đầu tiên sử dụng quân đen, người thứ hai sử dụng
                  quân trắng. Lần lượt đặt quân trên bàn cờ 15x15
                </p>
              </div>
              <div className="rule-item">
                <h3>Thắng thua</h3>
                <p>
                  Người đầu tiên tạo ra đường 5 quân liên tiếp sẽ thắng. Nếu bàn
                  cờ đầy mà không ai thắng thì hòa
                </p>
              </div>
            </div>
            <div className="rules-visual">
              <div className="winning-example">
                <h4>Ví dụ thắng - 5 quân ngang</h4>
                <div className="mini-board">
                  <div className="winning-line">
                    <div className="stone black"></div>
                    <div className="stone black"></div>
                    <div className="stone black"></div>
                    <div className="stone black"></div>
                    <div className="stone black"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Người chơi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Trận đấu</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Hoạt động</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Sẵn sàng thử thách bản thân?</h2>
          <p>Tham gia cộng đồng người chơi Caro ngay hôm nay!</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Đăng ký miễn phí
            </Link>
            <Link to="/lobby" className="btn btn-outline">
              Chơi ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
