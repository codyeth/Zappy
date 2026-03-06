-- ============================================================
-- Migration: Seed — Games (5 real + 40 placeholders)
-- Run once. Uses ON CONFLICT DO NOTHING so safe to re-run.
-- ============================================================

insert into public.games
  (slug, title, description, instructions, category, is_active, is_coming_soon)
values

-- ─── 5 Real Games ────────────────────────────────────────────────────────────

('gold-miner',
 'Đào Vàng',
 'Game arcade kinh điển Việt Nam! Điều khiển cần câu để thu thập vàng và đá quý. Đạt điểm mục tiêu trước khi hết thời gian.',
 'Di chuyển cần câu bằng phím ← →. Thả móc bằng Space hoặc ↓. Thu thập vàng, đá quý và tránh đá thường.',
 'action', true, false),

('puzzle-2048',
 '2048',
 'Trượt các ô số để ghép đôi chúng. Đạt được ô 2048 để chiến thắng! Game trí tuệ đơn giản nhưng cực kỳ thú vị.',
 'Dùng phím ← → ↑ ↓ hoặc vuốt để di chuyển tất cả ô. Hai ô cùng số sẽ ghép thành 1. Đạt 2048 để thắng!',
 'puzzle', true, false),

('tetris',
 'Tetris',
 'Game xếp hình kinh điển của mọi thời đại. Xoay và đặt các khối tetromino để hoàn thành hàng ngang và ghi điểm.',
 '← → di chuyển. ↑ hoặc X xoay. ↓ rơi nhanh. Space rơi thẳng. P tạm dừng.',
 'puzzle', true, false),

('flappy-zap',
 'Flappy Zap',
 'Nhấp để bay qua các ống! Phiên bản Zappy của Flappy Bird với tốc độ nhanh hơn và màu sắc bắt mắt.',
 'Nhấp chuột hoặc Space để vỗ cánh. Tránh các ống xanh. Qua mỗi cột ống được 1 điểm.',
 'casual', true, false),

('minesweeper',
 'Dò Mìn',
 'Game logic kinh điển! Tìm và đánh dấu tất cả các ô chứa mìn mà không kích nổ chúng.',
 'Click trái để mở ô. Click phải để đặt cờ. Số cho biết bao nhiêu mìn xung quanh ô đó.',
 'puzzle', true, false),

-- ─── Action (4 placeholders) ─────────────────────────────────────────────────

('space-warrior',    'Space Warrior',    'Bắn hạ phi thuyền địch trong không gian vô tận.', '', 'action', true, true),
('ninja-rush',       'Ninja Rush',       'Chạy và chém đường qua kẻ thù bằng kỹ năng ninja.', '', 'action', true, true),
('robot-rampage',    'Robot Rampage',    'Điều khiển robot khổng lồ phá hủy thành phố.', '', 'action', true, true),
('zombie-siege',     'Zombie Siege',     'Bảo vệ căn cứ khỏi làn sóng zombie tấn công.', '', 'action', true, true),

-- ─── Adventure (3) ───────────────────────────────────────────────────────────

('lost-kingdom',     'Lost Kingdom',     'Khám phá vương quốc bí ẩn đầy bẫy và kho báu.', '', 'adventure', true, true),
('jungle-quest',     'Jungle Quest',     'Phiêu lưu trong rừng rậm tìm kiếm đền cổ.', '', 'adventure', true, true),
('pirate-treasure',  'Pirate Treasure',  'Vượt biển cả tìm kho báu hải tặc huyền thoại.', '', 'adventure', true, true),

-- ─── Basketball (2) ──────────────────────────────────────────────────────────

('slam-dunk',        'Slam Dunk',        'Ném bóng rổ chính xác vào rổ với các góc độ khó.', '', 'basketball', true, true),
('street-hoops',     'Street Hoops',     'Bóng rổ đường phố 1 vs 1 căng thẳng.', '', 'basketball', true, true),

-- ─── Bike (2) ────────────────────────────────────────────────────────────────

('moto-x3m',         'Moto X3M',         'Đua xe máy trên địa hình cực kỳ nguy hiểm.', '', 'bike', true, true),
('bmx-stunts',       'BMX Stunts',       'Biểu diễn stunts BMX chuyên nghiệp.', '', 'bike', true, true),

-- ─── Car (2) ─────────────────────────────────────────────────────────────────

('traffic-racer',    'Traffic Racer',    'Lách qua dòng xe cộ đông đúc ở tốc độ cao.', '', 'car', true, true),
('car-crusher',      'Car Crusher',      'Nghiền nát xe hơi với cỗ máy khổng lồ.', '', 'car', true, true),

-- ─── Card (3) ────────────────────────────────────────────────────────────────

('poker-night',      'Poker Night',      'Chơi poker Texas Hold em với AI thông minh.', '', 'card', true, true),
('solitaire-plus',   'Solitaire Plus',   'Klondike Solitaire cổ điển với giao diện đẹp.', '', 'card', true, true),
('blackjack-pro',    'Blackjack Pro',    'Xì dách chuyên nghiệp — đánh bại nhà cái.', '', 'card', true, true),

-- ─── Casual (3) ──────────────────────────────────────────────────────────────

('bubble-pop',       'Bubble Pop',       'Bắn bong bóng cùng màu để ghi điểm.', '', 'casual', true, true),
('candy-crush-z',    'Candy Crush Z',    'Xếp kẹo ngọt theo combo để đạt điểm cao.', '', 'casual', true, true),
('cooking-frenzy',   'Cooking Frenzy',   'Nấu ăn nhanh tay để phục vụ khách hàng.', '', 'casual', true, true),

-- ─── Clicker (2) ─────────────────────────────────────────────────────────────

('cookie-empire',    'Cookie Empire',    'Click để làm bánh và xây dựng đế chế bánh ngọt.', '', 'clicker', true, true),
('idle-factory',     'Idle Factory',     'Xây nhà máy tự động và kiếm tiền khi offline.', '', 'clicker', true, true),

-- ─── Driving (2) ─────────────────────────────────────────────────────────────

('drift-king',       'Drift King',       'Drift xe trên đường đua và ghi điểm phong cách.', '', 'driving', true, true),
('highway-patrol',   'Highway Patrol',   'Tuần tra cao tốc và truy đuổi tội phạm.', '', 'driving', true, true),

-- ─── Escape (2) ──────────────────────────────────────────────────────────────

('haunted-house',    'Haunted House',    'Thoát khỏi ngôi nhà ma ám đầy bí ẩn.', '', 'escape', true, true),
('prison-break-z',   'Prison Break Z',   'Lên kế hoạch và thực hiện vụ vượt ngục hoàn hảo.', '', 'escape', true, true),

-- ─── FPS (2) ─────────────────────────────────────────────────────────────────

('pixel-shooter',    'Pixel Shooter',    'Bắn súng theo phong cách pixel art retro.', '', 'fps', true, true),
('sniper-elite-z',   'Sniper Elite Z',   'Hạ mục tiêu từ khoảng cách xa với súng bắn tỉa.', '', 'fps', true, true),

-- ─── Horror (2) ──────────────────────────────────────────────────────────────

('five-nights-z',    'Five Nights Z',    'Sống sót qua 5 đêm kinh hoàng tại nhà kho.', '', 'horror', true, true),
('granny-escape',    'Granny Escape',    'Trốn thoát khỏi ngôi nhà của bà lão đáng sợ.', '', 'horror', true, true),

-- ─── .io (2) ─────────────────────────────────────────────────────────────────

('agar-z',           'Agar Z',           'Ăn cell nhỏ hơn để lớn dần và thống trị bản đồ.', '', 'io', true, true),
('slither-z',        'Slither Z',        'Điều khiển rắn dài nhất bản đồ — sinh tồn!', '', 'io', true, true),

-- ─── Mahjong (2) ─────────────────────────────────────────────────────────────

('mahjong-classic',  'Mahjong Classic',  'Tìm và ghép cặp các ô mahjong giống nhau.', '', 'mahjong', true, true),
('shanghai-tiles',   'Shanghai Tiles',   'Phiên bản Shanghai của mahjong solitaire.', '', 'mahjong', true, true),

-- ─── Racing (2) ──────────────────────────────────────────────────────────────

('speed-racer',      'Speed Racer',      'Đua xe tốc độ cao trên các đường đua thế giới.', '', 'racing', true, true),
('formula-z',        'Formula Z',        'F1 đơn giản hóa — vô địch từng mùa giải.', '', 'racing', true, true),

-- ─── Shooting (2) ────────────────────────────────────────────────────────────

('target-master',    'Target Master',    'Bắn vào tâm bia để ghi điểm hoàn hảo.', '', 'shooting', true, true),
('duck-hunt-z',      'Duck Hunt Z',      'Bắn vịt trời kinh điển với khẩu súng laser.', '', 'shooting', true, true),

-- ─── Soccer (2) ──────────────────────────────────────────────────────────────

('world-cup-z',      'World Cup Z',      'Tranh tài World Cup và đưa đội nhà lên đỉnh.', '', 'soccer', true, true),
('penalty-kick',     'Penalty Kick',     'Đá penalty — góc nào để qua thủ môn AI?', '', 'soccer', true, true),

-- ─── Sports (2) ──────────────────────────────────────────────────────────────

('tennis-pro',       'Tennis Pro',       'Quần vợt đơn giản — đánh bại đối thủ AI.', '', 'sports', true, true),
('boxing-champ',     'Boxing Champ',     'Đấu boxing và leo lên ngôi vô địch.', '', 'sports', true, true),

-- ─── Stickman (2) ────────────────────────────────────────────────────────────

('stickman-fight',   'Stickman Fight',   'Đánh nhau phong cách stickman mượt mà.', '', 'stickman', true, true),
('stick-archer',     'Stick Archer',     'Bắn cung stickman — chính xác từng mũi tên.', '', 'stickman', true, true),

-- ─── Tower Defense (2) ───────────────────────────────────────────────────────

('kingdom-rush-z',   'Kingdom Rush Z',   'Xây tháp phòng thủ ngăn chặn đội quân xâm lược.', '', 'tower-defense', true, true),
('bloons-z',         'Bloons Z',         'Nổ bong bóng trước khi chúng vượt qua phòng tuyến.', '', 'tower-defense', true, true)

on conflict (slug) do nothing;
