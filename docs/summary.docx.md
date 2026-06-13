**TÀI LIỆU PHÂN TÍCH FLOW & API ENDPOINTS**

**MỤC LỤC**

[1\. Tổng quan	2](#1.-tổng-quan)

[Quy ước	2](#quy-ước)

[2\. Tóm tắt số endpoint theo service	2](#2.-tóm-tắt-số-endpoint-theo-service)

[3\. Phân tích flow nghiệp vụ	3](#3.-phân-tích-flow-nghiệp-vụ)

[Flow 01: XÁC THỰC TÀI KHOẢN	3](#flow-01:-xác-thực-tài-khoản)

[Flow 02: QUẢN LÝ HỒ SƠ NGƯỜI DÙNG	4](#flow-02:-quản-lý-hồ-sơ-người-dùng)

[Flow 03 — QUẢN LÝ & HỌC KHÓA HỌC	5](#flow-03:-quản-lý-và-học-khóa-học)

[Flow 04 — QUẢN LÝ CÂU HỎI & CẤU HÌNH ĐỀ THI	7](#flow-04-—-quản-lý-câu-hỏi-&-cấu-hình-đề-thi)

[Flow 05 — THI THỬ LÝ THUYẾT	8](#flow-05-—-thi-thử-lý-thuyết)

[Flow 06 — SA HÌNH & MÔ PHỎNG THỰC HÀNH	10](#flow-06-—-sa-hình-&-mô-phỏng-thực-hành)

[Flow 07 — THÔNG BÁO & DASHBOARD ADMIN	11](#flow-07-—-thông-báo-&-dashboard-admin)

[4\. Toàn bộ endpoints hiện có	12](#4.-toàn-bộ-endpoints-hiện-có)

[1\. Identity Service \- /auth/\*, /admin/identity-users/\* (14 endpoints)	12](#1.-identity-service---/auth/*,-/admin/identity-users/*-\(14-endpoints\))

[2\. User Service — /users/\*, /admin/users/\* (8 endpoints)	13](#2.-user-service-—-/users/*,-/admin/users/*-\(8-endpoints\))

[3\. Exam Service — /exams/\*, /admin/exams/\* (14 endpoints)	14](#3.-exam-service-—-/exams/*,-/admin/exams/*-\(14-endpoints\))

[4\. Course Service — /courses/\*, /enrollments/\*, /admin/courses/\* (16 endpoints)	15](#4.-course-service-—-/courses/*,-/enrollments/*,-/admin/courses/*-\(16-endpoints\))

[5\. Question Service — /admin/questions/\* (10 endpoints)	16](#5.-question-service-—-/admin/questions/*-\(10-endpoints\))

[6\. Notification Service — /notifications/\*, /admin/academic-warnings/\* (5 endpoints)	17](#6.-notification-service-—-/notifications/*,-/admin/academic-warnings/*-\(5-endpoints\))

[7\. Analytics Service — /analytics/\*, /admin/analytics/\* (2 endpoints)	17](#7.-analytics-service-—-/analytics/*,-/admin/analytics/*-\(2-endpoints\))

[8\. Simulation Service — /simulation/\*, /practice2d/\* (10 endpoints)	18](#8.-simulation-service-—-/simulation/*,-/practice2d/*-\(10-endpoints\))

[9\. Media Service — /media/\*, /admin/media/\* (6 endpoints)	18](#9.-media-service-—-/media/*,-/admin/media/*-\(6-endpoints\))

[10\. Audit Service — /admin/audit-logs/\* (2 endpoints)	19](#10.-audit-service-—-/admin/audit-logs/*-\(2-endpoints\))

[5\. Phần C — Endpoints cần bổ sung	19](#5.-phần-c-—-endpoints-cần-bổ-sung)

[6\. Phần D — Lưu ý kiến trúc & TODO	23](#6.-phần-d-—-lưu-ý-kiến-trúc-&-todo)

[Telemetry 2D (Simulation)	23](#telemetry-2d-\(simulation\))

[Exam timer server-side	23](#exam-timer-server-side)

[Exam type field	23](#exam-type-field)

[Media upload flow	23](#media-upload-flow)

[Multi-instructor	23](#multi-instructor)

[Course lessons gap	23](#course-lessons-gap)

[Simulation result gap	24](#simulation-result-gap)

[Auth flow	24](#auth-flow)

## 1\. Tổng quan {#1.-tổng-quan}

| Hạng mục | Số lượng |
| ----- | :---: |
| Endpoints hiện có | 87 |
| Endpoints cần bổ sung | 36 |
| P1 Critical | 14 |
| P2 High | 18 |
| P3 Nice to have | 4 |

### Quy ước {#quy-ước}

* **P1 Critical**: chặn flow chính, nên ưu tiên làm trước.

* **P2 High**: quan trọng cho UX hoặc quản trị.

* **P3 Nice to have**: tính năng nâng cao, chưa bắt buộc.

* Platform: Web, Mobile, hoặc Web \+ Mobile.

## 2\. Tóm tắt số endpoint theo service {#2.-tóm-tắt-số-endpoint-theo-service}

| Service | Route chính | Số endpoint hiện có |
| ----- | ----- | :---: |
| Identity Service | /auth/\*, /admin/identity-users/\* | 14 |
| User Service | /users/\*, /admin/users/\* | 8 |
| Exam Service | /exams/\*, /admin/exams/\* | 14 |
| Course Service | /courses/\*, /enrollments/\*, /admin/courses/\* | 16 |
| Question Service | /admin/questions/\* | 10 |
| Notification Service | /notifications/\*, /admin/academic-warnings/\* | 5 |
| Analytics Service | /analytics/\*, /admin/analytics/\* | 2 |
| Simulation Service | /simulation/\*, /practice2d/\* | 10 |
| Media Service | /media/\*, /admin/media/\* | 6 |
| Audit Service | /admin/audit-logs/\* | 2 |
| **Tổng** |  | **87** |

## 

## 3\. Phân tích flow nghiệp vụ {#3.-phân-tích-flow-nghiệp-vụ}

### Flow 01: Xác thực tài khoản {#flow-01:-xác-thực-tài-khoản}

**Platform:** Web \+ Mobile

**Tóm tắt:** Onboarding → Đăng nhập → Quên mật khẩu → Auto refresh token → Đăng xuất.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Splash (1)(2)(3) | Mobile | GET /auth/public |  | Kiểm tra JWT còn hạn → auto redirect Home.  Không token → màn hình Login. |
| 2 | Login | Web \+ Mobile | POST /auth/login |  | Trả access\_token \+ refresh\_token. |
| 3 | Forgot password (1)(2)(3) | Web \+ Mobile | POST /auth/forgot-password | **P1** POST /auth/reset-password | Web: 3 bước modal. Mobile: màn “Đặt lại mật khẩu” riêng. Thiếu endpoint nhận token reset. |
| 4 | Toàn bộ màn hình (interceptor) | Web \+ Mobile | POST /auth/refresh POST /auth/logout DELETE /notifications/device-token/:token |  | Interceptor tự gọi /refresh khi 401\. Logout đồng thời xóa FCM token. |

### 

### Flow 02: Quản lý hồ sơ người dùng {#flow-02:-quản-lý-hồ-sơ-người-dùng}

**Platform:** Web \+ Mobile

**Tóm tắt:** Tạo tài khoản → Upload hồ sơ giấy tờ → Phân hạng bằng → Khóa tài khoản → Gửi cảnh báo → Profile mobile.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Quản lý người dùng | Web | GET /admin/users GET /admin/identity-users |  | Filter theo role, license tier, trạng thái. |
| 2 | Tạo người dùng mới Thêm học viên mới (upload hồ sơ, ảnh) | Web | POST /admin/identity-users POST /admin/users POST /media POST /media/init | **P1** POST /admin/users/:id/documents | Upload CCCD, ảnh thẻ. |
| 3 | Quản lý học viên (1)(2) Chi tiết học viên & lịch sử thi | Web | GET /admin/users/:id PATCH /admin/users/:id GET /admin/exams/sessions GET /admin/analytics/students/:id/progress | **P2** GET /admin/users/:id/documents |  |
| 4 | Phân hạng bằng | Web | PATCH /admin/users/:id/license-tierPATCH /admin/identity-users/:id/role |  |  |
| 5 | Khóa tài khoản | Web | PATCH /admin/identity-users/:id/lock PATCH /admin/users/:id/lock |  | Khóa 2 lớp: Identity (không đăng nhập) \+ User profile (ẩn nội bộ). Audit log ghi before/after. |
| 6 | Gửi cảnh báo | Web | POST /admin/academic-warnings |  |  |
| 7 | Profile | Mobile | GET /users/me PATCH /users/me POST /notifications/device-token | **P2** PATCH /users/me/avatar  **P1** POST /auth/change-password  **P2** GET /users/me/notification-preferences  **P2** PATCH /users/me/notification-preferences |  |

### 

### Flow 03: Quản lý và học khóa học {#flow-03:-quản-lý-và-học-khóa-học}

**Platform:** Web \+ Mobile

**Tóm tắt:** Admin tạo khóa → thêm bài học → kích hoạt. Học viên enroll → học bài → đánh dấu hoàn thành → theo dõi tiến trình.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Tạo khóa học (thông tin cơ bản) | Web | POST /admin/courses POST /media |  | Bước 1: tên, mô tả, thumbnail (upload qua media), hạng bằng target. |
| 2 | Tạo mới khóa học (Yêu cầu) Tạo mới khóa học (Nội dung) | Web | PATCH /admin/courses/:id POST /admin/courses/:id/lessons POST /admin/courses/:id/materials |  | Bước 2: prerequisites. Bước 3: thêm bài học, upload tài liệu. |
| 3 | Quản lý khóa học (1)(2) | Web | GET /admin/courses PATCH /admin/courses/:id/activate DELETE /admin/courses/:id |  |  |
| 4 | Chi tiết khóa học (lộ trình học) Chi tiết khóa học (tài liệu) Chi tiết khóa học (bài thi) | Web | GET /admin/courses/:id DELETE /admin/courses/:id/lessons/:lessonId GET /admin/exams/templates | **P1** GET /admin/courses/:id/lessons  **P1** PATCH /admin/courses/:id/lessons/:lessonId  **P2** GET /admin/courses/:id/materials | 3 tab: lộ trình, tài liệu, bài thi. Thiếu endpoint sửa bài học. |
| 5 | Giảng viên Thêm khóa học mới (component giảng viên phụ trách) | Web | GET /admin/users?role=instructor PATCH /admin/identity-users/:id/role | **P2** GET /admin/instructors  **P2** POST /admin/courses/:id/instructors  **P2** DELETE /admin/courses/:id/instructors/:userId | TODO Figma: component giảng viên chọn nhiều — cần bảng join course\_instructors. |
| 6 | Home (phần khóa học) | Mobile | GET /coursesGET /enrollmentsGET /analytics/me/progress | — | Gọi 3 service song song để render dashboard học tập. |
| 7 | Luyện tập (học nội dung) | Mobile | GET /courses/:idPOST /courses/:id/enrollGET /enrollments/:idGET /media/:id/url | **P1** GET /courses/:id/lessons**P1** GET /courses/:id/lessons/:lessonId**P2** GET /courses/:id/materials**P2** POST /courses/:id/unenroll | Frame 1078px. Không có API lấy nội dung bài học là BLOCKER. |
| 8 | Luyện tập (hoàn thành bài) | Mobile | POST /enrollments/:id/lessons/:lId/completePOST /enrollments/:id/reset-progress | — | Checkmark bài → cập nhật %. Reset để học lại từ đầu. |

### Flow 04 — QUẢN LÝ CÂU HỎI & CẤU HÌNH ĐỀ THI {#flow-04-—-quản-lý-câu-hỏi-&-cấu-hình-đề-thi}

* **Platform:** Web Admin

* **Tóm tắt:** Admin quản lý ngân hàng câu hỏi theo chủ đề và cấu hình mẫu đề thi 2 loại (Ôn tập / Sát hạch).

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| ----: | :---- | :---- | :---- | :---- | :---- |
| 1 | Quản lý câu hỏi (1)(2) | Web | GET /admin/questionsGET /admin/questions/topicsDELETE /admin/questions/:id | — | TODO Figma: hỏi lại phần quản lý câu hỏi, cấu hình đề thi. (1)(2): filter theo topic/hạng bằng. |
| 2 | Thêm câu hỏi mới | Web | POST /admin/questionsPATCH /admin/questions/:idPOST /admin/questions/topicsPATCH /admin/questions/topics/:idPOST /media | — | Frame cao 1221px: nội dung, 4 đáp án, đáp án đúng, giải thích, ảnh minh họa, topic, hạng bằng. |
| 3 | Cấu hình đề thiTạo cấu hình | Web | GET /admin/exams/templatesPOST /admin/exams/templatesPATCH /admin/exams/templates/:idDELETE /admin/exams/templates/:id | **P2** GET /admin/exams/templates/:id/questions | TODO Figma: chỉ 2 loại đề (Ôn tập / Sát hạch). Field type cần thêm vào template. Frame Tạo cấu hình cao 1344px. |

### Flow 05 — THI THỬ LÝ THUYẾT {#flow-05-—-thi-thử-lý-thuyết}

* **Platform:** Mobile

* **Tóm tắt:** Chọn đề → Làm bài (autosave) → Xác nhận nộp → Kết quả → Xem câu sai → Ôn yếu điểm → Lịch sử.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| ----: | :---- | :---- | :---- | :---- | :---- |
| 1 | Home → Vào thi | Mobile | GET /exams/available | — | TODO Figma: chỉ 2 loại (Ôn tập / Sát hạch). Response cần field type để render 2 tab. |
| 2 | Đề thi (ôn tập)Đề thi (sát hạch) | Mobile | POST /exams/sessionsGET /exams/sessions/:id/questionsPATCH /exams/sessions/:id/answers | **P1** GET /exams/sessions/:id/timer**P1** PATCH /exams/sessions/:id/pause**P1** PATCH /exams/sessions/:id/resume**P3** PATCH /exams/sessions/:id/flag-questions | Ôn tập: không giới hạn giờ, xem đáp án ngay. Sát hạch: đếm giờ server-side, ẩn đáp án. |
| 3 | Xác nhận nộp bài → Kết quả thi | Mobile | POST /exams/sessions/:id/submitGET /exams/sessions/:id/result | — | TODO Figma: “Popup xác nhận nộp bài” — frame riêng đã có. Kết quả: điểm, đậu/rớt, số câu đúng/sai. |
| 4 | Xem câu saiÔn yếu điểm | Mobile | GET /exams/missed-questions | **P1** GET /exams/sessions/:id/review**P2** GET /exams/statistics/me | “Xem câu sai”: xem ngay sau thi. “Ôn yếu điểm”: bộ sưu tập câu sai tích lũy dài hạn. |
| 5 | Lịch sửChi tiết bài thi | Mobile | GET /exams/sessionsGET /exams/sessions/:id/result | — | Tab Lịch sử → tap session → xem lại chi tiết. |

### Flow 06 — SA HÌNH & MÔ PHỎNG THỰC HÀNH {#flow-06-—-sa-hình-&-mô-phỏng-thực-hành}

* **Platform:** Mobile

* **Tóm tắt:** Xem 11 bài sa hình → Mô phỏng tình huống nguy hiểm → Tập lái 2D với telemetry real-time.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| ----: | :---- | :---- | :---- | :---- | :---- |
| 1 | Các checkpointChi tiết checkpoint | Mobile | GET /simulation/maneuversGET /simulation/maneuvers/:idGET /simulation/maneuver-errors | — | 11 bài: Xuất phát, Dừng vạch đi bộ, Dốc cầu, Hàng đinh chữ Z, Ngã tư, Chữ S, Đỗ xe, Xe lửa, Tăng tốc, Ghép xe ngang, Kết thúc. |
| 2 | Trợ lý thực hành ảo(mô phỏng tình huống) | Mobile | POST /simulation/sessionsPATCH /simulation/sessions/:id/answersPOST /simulation/sessions/:id/submit | **P1** GET /simulation/sessions**P1** GET /simulation/sessions/:id/result | TODO Figma: sửa lại trợ lý thực hành ảo. Submit không có kết quả \= blocker UX. |
| 3 | Tập lái 2D | Mobile | POST /simulation/practice2d/sessionsPOST /simulation/practice2d/sessions/:id/telemetryPOST /simulation/practice2d/sessions/:id/endGET /simulation/practice2d/sessions/:id | **P2** GET /simulation/practice2d/sessions | Telemetry POST liên tục — nên batch 2-3s/lần. Frame “Lỗi chung” handle mất kết nối. |

### Flow 07 — THÔNG BÁO & DASHBOARD ADMIN {#flow-07-—-thông-báo-&-dashboard-admin}

* **Platform:** Web \+ Mobile

* **Tóm tắt:** In-app notification → Push preference → Dashboard KPI → Audit logs → Analytics cá nhân.

| \# | Màn hình | Platform | Endpoints hiện có | Cần bổ sung | Ghi chú |
| ----: | :---- | :---- | :---- | :---- | :---- |
| 1 | Thông báo (2 frame) | Mobile | GET /notifications/mePATCH /notifications/:id/read | **P2** PATCH /notifications/mark-all-read | 2 frame \= 2 tab: chưa đọc / tất cả. Thiếu “đánh dấu tất cả đã đọc”. |
| 2 | Dashboard (Web Admin) | Web | GET /admin/audit-logsGET /admin/audit-logs/:idGET /admin/analytics/students/:id/progress | **P2** GET /admin/analytics/overview | Frame cao 1762px. Cần API KPI tổng hợp: MAU, tỉ lệ đậu, khóa học active. |
| 3 | Analytics cá nhânÔn yếu điểm (mobile) | Mobile | GET /analytics/me/progress | **P2** GET /analytics/me/weak-topics**P3** GET /analytics/me/study-streak | Dashboard học viên: tiến trình, chủ đề yếu, chuỗi ngày học. |
| 4 | Luyện tập câu hỏi tự do | Mobile | — | **P2** GET /questions/topics**P2** GET /questions/practice**P3** POST /questions/:id/report | Luyện câu hỏi theo chủ đề tự chọn mà không tạo session thi chính thức. |

## 4\. Toàn bộ endpoints hiện có {#4.-toàn-bộ-endpoints-hiện-có}

Tổng cộng **87 endpoints hiện có** được phân bổ trên **10 service**.

### 1\. Identity Service \- /auth/\*, /admin/identity-users/\* (14 endpoints) {#1.-identity-service---/auth/*,-/admin/identity-users/*-(14-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| POST | Public | /auth/login | Tất cả | Đăng nhập, cấp JWT access\_token \+ refresh\_token |
| POST | JWT | /auth/logout | User | Đăng xuất, vô hiệu hóa session Keycloak |
| POST | Public | /auth/refresh | Tất cả | Dùng refresh\_token cấp lại access\_token mới |
| POST | Public | /auth/forgot-password | Tất cả | Yêu cầu gửi email khôi phục mật khẩu |
| GET | Public | /auth/public | Tất cả | Endpoint kiểm thử — không cần token |
| GET | JWT | /auth/private | User | Endpoint kiểm thử — cần JWT hợp lệ |
| GET | Admin | /auth/admin-check | Admin | Endpoint kiểm thử — cần role Admin |
| POST | Admin | /admin/identity-users | Admin | Admin tạo tài khoản Identity mới trên Keycloak |
| GET | Admin | /admin/identity-users | Admin | Liệt kê tất cả tài khoản từ Keycloak |
| GET | Admin | /admin/identity-users/:id | Admin | Lấy thông tin tài khoản cụ thể |
| PATCH | Admin | /admin/identity-users/:id | Admin | Cập nhật thông tin cơ bản tài khoản |
| PATCH | Admin | /admin/identity-users/:id/role | Admin | Gán role: Admin / User / Instructor |
| PATCH | Admin | /admin/identity-users/:id/lock | Admin | Khóa hoặc mở khóa tài khoản (Ban/Unban) |
| DELETE | Admin | /admin/identity-users/:id | Admin | Xóa tài khoản Identity vĩnh viễn khỏi Keycloak |

### 2\. User Service — /users/\*, /admin/users/\* (8 endpoints) {#2.-user-service-—-/users/*,-/admin/users/*-(8-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| GET | JWT | /users/me | User | Lấy hồ sơ người dùng đang đăng nhập |
| PATCH | JWT | /users/me | User | Cập nhật hồ sơ cá nhân (tên, SĐT, ngày sinh…) |
| POST | Admin | /admin/users | Admin | Admin tạo hồ sơ User (bypass Keycloak event) |
| GET | Admin | /admin/users | Admin | Danh sách tất cả user profiles trong hệ thống |
| GET | Admin | /admin/users/:id | Admin | Xem hồ sơ chi tiết của một người dùng |
| PATCH | Admin | /admin/users/:id | Admin | Chỉnh sửa dữ liệu hồ sơ người dùng |
| PATCH | Admin | /admin/users/:id/lock | Admin | Khóa hồ sơ User nội bộ (khác với khóa Identity) |
| PATCH | Admin | /admin/users/:id/license-tier | Admin | Gán hạng bằng lái mục tiêu: B1, B2, C, D, E |

### 3\. Exam Service — /exams/\*, /admin/exams/\* (14 endpoints) {#3.-exam-service-—-/exams/*,-/admin/exams/*-(14-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| POST | JWT | /exams/sessions | User | Bắt đầu phiên làm bài thi thử mới |
| GET | JWT | /exams/sessions | User | Lịch sử các phiên thi của học viên |
| GET | JWT | /exams/sessions/:id/questions | User | Tải bộ câu hỏi cho một bài thi |
| PATCH | JWT | /exams/sessions/:id/answers | User | Gửi câu trả lời, hỗ trợ autosave từng câu |
| POST | JWT | /exams/sessions/:id/submit | User | Nộp bài, chấm điểm tự động đậu/rớt |
| GET | JWT | /exams/sessions/:id/result | User | Xem kết quả chi tiết: điểm, thời gian, câu sai/đúng |
| GET | JWT | /exams/available | User | Danh sách đề thi có sẵn để học viên chọn |
| GET | JWT | /exams/missed-questions | User | Bộ câu hỏi từng trả lời sai để ôn lại |
| GET | Admin | /admin/exams/sessions | Admin | Admin giám sát lịch sử thi của toàn hệ thống |
| POST | Admin | /admin/exams/templates | Admin | Tạo mẫu đề thi mới |
| GET | Admin | /admin/exams/templates | Admin | Danh sách các mẫu đề thi |
| GET | Admin | /admin/exams/templates/:id | Admin | Xem chi tiết nội dung mẫu đề thi |
| PATCH | Admin | /admin/exams/templates/:id | Admin | Sửa thông tin mẫu đề thi |
| DELETE | Admin | /admin/exams/templates/:id | Admin | Xóa mẫu đề thi |

### 4\. Course Service — /courses/\*, /enrollments/\*, /admin/courses/\* (16 endpoints) {#4.-course-service-—-/courses/*,-/enrollments/*,-/admin/courses/*-(16-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| GET | JWT | /courses | User | Danh sách khóa học public cho học viên |
| GET | JWT | /courses/:id | User | Chi tiết nội dung mô tả khóa học |
| POST | JWT | /courses/:id/enroll | User | Ghi danh đăng ký học khóa |
| GET | JWT | /enrollments | User | Danh sách khóa học đã đăng ký |
| GET | JWT | /enrollments/:id | User | Chi tiết tiến trình (% hoàn thành) trong khóa |
| POST | JWT | /enrollments/:id/lessons/:lessonId/complete | User | Đánh dấu bài học đã xem xong |
| POST | JWT | /enrollments/:id/reset-progress | User | Xóa tiến độ, học lại từ đầu |
| POST | Admin | /admin/courses | Admin | Khởi tạo khóa học mới |
| GET | Admin | /admin/courses | Admin | Toàn bộ danh sách khóa (kể cả draft/ẩn) |
| GET | Admin | /admin/courses/:id | Admin | Chi tiết khóa học |
| PATCH | Admin | /admin/courses/:id | Admin | Cập nhật metadata khóa học |
| PATCH | Admin | /admin/courses/:id/activate | Admin | Bật/Tắt khóa học hiển thị ra ngoài |
| POST | Admin | /admin/courses/:id/lessons | Admin | Thêm bài học mới vào lộ trình khóa học |
| DELETE | Admin | /admin/courses/:id/lessons/:lessonId | Admin | Xóa bài học |
| POST | Admin | /admin/courses/:id/materials | Admin | Đính kèm file tài liệu cho khóa học |
| DELETE | Admin | /admin/courses/:id | Admin | Xóa hoàn toàn khóa học |

### 5\. Question Service — /admin/questions/\* (10 endpoints) {#5.-question-service-—-/admin/questions/*-(10-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| POST | Admin | /admin/questions/topics | Admin | Tạo chủ đề câu hỏi (Biển báo, Sa hình, Tình huống…) |
| GET | Admin | /admin/questions/topics | Admin | Danh sách các chủ đề câu hỏi |
| GET | Admin | /admin/questions/topics/:id | Admin | Chi tiết chủ đề |
| PATCH | Admin | /admin/questions/topics/:id | Admin | Cập nhật thông tin chủ đề |
| POST | Admin | /admin/questions/pool | Admin | Nạp dữ liệu câu hỏi hàng loạt (seed data) |
| POST | Admin | /admin/questions | Admin | Tạo một câu hỏi mới |
| GET | Admin | /admin/questions | Admin | Truy vấn ngân hàng câu hỏi (filter, search) |
| GET | Admin | /admin/questions/:id | Admin | Xem chi tiết câu hỏi, đáp án và giải thích |
| PATCH | Admin | /admin/questions/:id | Admin | Sửa nội dung câu hỏi hoặc thay đổi đáp án đúng |
| DELETE | Admin | /admin/questions/:id | Admin | Loại bỏ câu hỏi khỏi ngân hàng |

### 6\. Notification Service — /notifications/\*, /admin/academic-warnings/\* (5 endpoints) {#6.-notification-service-—-/notifications/*,-/admin/academic-warnings/*-(5-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| POST | JWT | /notifications/device-token | User | Đăng ký FCM/APNS device token nhận Push Notification |
| DELETE | JWT | /notifications/device-token/:token | User | Xóa device token khi đăng xuất |
| GET | JWT | /notifications/me | User | Đọc hộp thư In-app notification |
| PATCH | JWT | /notifications/:id/read | User | Đánh dấu một thông báo đã đọc |
| POST | Admin | /admin/academic-warnings | Admin | Phát cảnh báo học tập đến học viên |

### 7\. Analytics Service — /analytics/\*, /admin/analytics/\* (2 endpoints) {#7.-analytics-service-—-/analytics/*,-/admin/analytics/*-(2-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| GET | JWT | /analytics/me/progress | User | Dashboard tiến trình cá nhân: tỉ lệ đúng, chuyên đề yếu |
| GET | Admin | /admin/analytics/students/:studentId/progress | Admin | Giám sát năng lực và độ siêng năng của học viên |

### 8\. Simulation Service — /simulation/\*, /practice2d/\* (10 endpoints) {#8.-simulation-service-—-/simulation/*,-/practice2d/*-(10-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| GET | JWT | /simulation/maneuvers | User | Danh sách 11 bài sa hình chuẩn |
| GET | JWT | /simulation/maneuvers/:id | User | Chi tiết một bài sa hình |
| GET | JWT | /simulation/maneuver-errors | User | Bảng tra cứu các lỗi bị trừ điểm tiêu chuẩn |
| POST | JWT | /simulation/sessions | User | Bắt đầu phiên mô phỏng tình huống nguy hiểm |
| PATCH | JWT | /simulation/sessions/:id/answers | User | Ghi nhận thao tác/thời gian phản xạ của học viên |
| POST | JWT | /simulation/sessions/:id/submit | User | Kết thúc phiên, chấm dải điểm (5đ, 4đ, …) |
| POST | JWT | /simulation/practice2d/sessions | User | Khởi tạo chuyến tập lái ảo 2D |
| POST | JWT | /simulation/practice2d/sessions/:id/telemetry | User | Gửi dữ liệu telemetry liên tục (tốc độ, tọa độ, đèn) |
| POST | JWT | /simulation/practice2d/sessions/:id/end | User | Kết thúc buổi tập, server lưu log hành trình |
| GET | JWT | /simulation/practice2d/sessions/:id | User | Render lại hành trình cũ để xem phân tích |

### 9\. Media Service — /media/\*, /admin/media/\* (6 endpoints) {#9.-media-service-—-/media/*,-/admin/media/*-(6-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| POST | JWT | /media | User/Admin | Upload file nhỏ trực tiếp qua formData |
| POST | JWT | /media/init | User/Admin | Khởi tạo upload lớn — trả presigned S3 multipart URL |
| GET | JWT | /media/:id | User/Admin | Đọc metadata của file |
| GET | JWT | /media/:id/url | User/Admin | Lấy Public URL hoặc Signed Link để stream ảnh/video |
| GET | Admin | /admin/media | Admin | Admin kiểm kê tất cả file trong kho lưu trữ |
| DELETE | Admin | /admin/media/:id | Admin | Xóa file rác (orphan files) |

### 10\. Audit Service — /admin/audit-logs/\* (2 endpoints) {#10.-audit-service-—-/admin/audit-logs/*-(2-endpoints)}

| Method | Auth | Endpoint | Access | Mô tả |
| :---- | :---- | :---- | :---- | :---- |
| GET | Admin | /admin/audit-logs | Admin | Danh sách lịch sử truy cập và sửa đổi nhạy cảm |
| GET | Admin | /admin/audit-logs/:id | Admin | Xem Before/After JSON chi tiết của một thay đổi |

## 5\. Phần C — Endpoints cần bổ sung {#5.-phần-c-—-endpoints-cần-bổ-sung}

Tổng cộng **36 endpoints cần bổ sung**: **14 P1**, **18 P2**, **4 P3**.

| Ưu tiên | Method | Endpoint | Service | Mô tả & lý do cần |
| :---- | :---- | :---- | :---- | :---- |
| **P1** | POST | /auth/reset-password | Identity | Xác nhận reset từ link email. /forgot-password chỉ gửi mail, thiếu endpoint nhận token. |
| **P1** | POST | /auth/change-password | Identity | Đổi mật khẩu khi đã đăng nhập (màn Profile mobile cần). |
| **P2** | PATCH | /users/me/avatar | User | Upload ảnh đại diện. PATCH /users/me chỉ cập nhật text fields. |
| **P2** | GET | /users/me/notification-preferences | User | Đọc cài đặt thông báo: push, email reminder. |
| **P2** | PATCH | /users/me/notification-preferences | User | Bật/tắt từng loại thông báo cụ thể. |
| **P1** | POST | /admin/users/:id/documents | User | Upload giấy tờ học viên (CCCD, ảnh thẻ). Frame thêm học viên cao 2517px. |
| **P2** | GET | /admin/users/:id/documents | User | Xem danh sách giấy tờ đã upload của học viên. |
| **P1** | PATCH | /exams/sessions/:id/pause | Exam | Tạm dừng bài thi (app vào background trên mobile). Cần cặp với /resume. |
| **P1** | PATCH | /exams/sessions/:id/resume | Exam | Tiếp tục bài thi sau khi tạm dừng. |
| **P1** | GET | /exams/sessions/:id/timer | Exam | Đồng bộ đếm giờ server-side — tránh gian lận chỉnh giờ client. |
| **P1** | GET | /exams/sessions/:id/review | Exam | Xem lại từng câu với giải thích sau thi. /result chỉ trả điểm tổng. |
| **P2** | GET | /exams/statistics/me | Exam | Thống kê tỉ lệ đậu/rớt, số lần thi, điểm TB theo thời gian. |
| **P2** | GET | /admin/exams/templates/:id/questions | Exam | Xem câu hỏi trong một đề thi khi Admin cấu hình. |
| **P3** | PATCH | /exams/sessions/:id/flag-questions | Exam | Đánh dấu câu “cần xem lại” để skip và quay lại trong khi thi. |
| **P1** | GET | /courses/:id/lessons | Course | Danh sách bài học cho học viên — BLOCKER, không có không học được. |
| **P1** | GET | /courses/:id/lessons/:lessonId | Course | Nội dung chi tiết bài học: text, video URL, tài liệu. |
| **P1** | GET | /admin/courses/:id/lessons | Course | Admin xem danh sách bài học trong khóa để quản lý. |
| **P1** | PATCH | /admin/courses/:id/lessons/:lessonId | Course | Admin sửa bài học đã tạo. Hiện chỉ có POST tạo và DELETE. |
| **P2** | GET | /admin/courses/:id/materials | Course | Danh sách tài liệu đính kèm của khóa (admin view). |
| **P2** | GET | /courses/:id/materials | Course | Học viên tải tài liệu của khóa đã enroll. |
| **P2** | POST | /courses/:id/unenroll | Course | Hủy ghi danh (chuyển bằng hoặc nhập nhầm). |
| **P2** | GET | /admin/instructors | Course | Danh sách giảng viên. TODO Figma: component chọn nhiều. |
| **P2** | POST | /admin/courses/:id/instructors | Course | Gán nhiều giảng viên vào khóa học. |
| **P2** | DELETE | /admin/courses/:id/instructors/:userId | Course | Xóa giảng viên khỏi khóa học. |
| **P1** | GET | /simulation/sessions | Simulation | Lịch sử phiên mô phỏng tình huống của học viên. |
| **P1** | GET | /simulation/sessions/:id/result | Simulation | Kết quả chi tiết sau submit phiên tình huống — hiện thiếu hoàn toàn. |
| **P2** | GET | /simulation/practice2d/sessions | Simulation | Lịch sử tất cả chuyến tập lái 2D. |
| **P3** | GET | /simulation/leaderboard | Simulation | Bảng xếp hạng học viên — tạo tính cạnh tranh. |
| **P2** | PATCH | /notifications/mark-all-read | Notification | Đánh dấu tất cả thông báo đã đọc cùng lúc. |
| **P2** | GET | /admin/analytics/overview | Analytics | Dashboard KPI hệ thống: MAU, tỉ lệ đậu, khóa học active. |
| **P2** | GET | /analytics/me/weak-topics | Analytics | Phân tích chủ đề yếu nhất (thi thử \+ ôn tập). |
| **P3** | GET | /analytics/me/study-streak | Analytics | Chuỗi ngày học liên tiếp — gamification tăng retention. |
| **P2** | GET | /questions/topics | Question | Public API chủ đề câu hỏi cho học viên. |
| **P2** | GET | /questions/practice | Question | Luyện câu hỏi tự do theo chủ đề, không tạo session thi. |
| **P3** | POST | /questions/:id/report | Question | Học viên báo cáo câu hỏi sai/nhầm đáp án. |

## 6\. Phần D — Lưu ý kiến trúc & TODO {#6.-phần-d-—-lưu-ý-kiến-trúc-&-todo}

### Telemetry 2D (Simulation) {#telemetry-2d-(simulation)}

POST /practice2d/sessions/:id/telemetry gọi liên tục từ client, nên batch client-side mỗi 2–3 giây hoặc chuyển sang WebSocket/Server-Sent Events để giảm tải server khi nhiều học viên tập đồng thời.

### Exam timer server-side {#exam-timer-server-side}

Thời gian đếm ngược nên do server quản lý qua GET /exams/sessions/:id/timer, không tin tưởng client-side timer để tránh gian lận, đặc biệt với đề sát hạch.

### Exam type field {#exam-type-field}

Cần thêm field type: "practice" | "official" vào ExamTemplate và ExamSession để phân biệt 2 loại đề: Ôn tập và Sát hạch.

### Media upload flow {#media-upload-flow}

File nhỏ dùng POST /media qua formData. File lớn dùng POST /media/init để nhận presigned S3 multipart URL, client upload thẳng lên S3 rồi server confirm.

### Multi-instructor {#multi-instructor}

Component giảng viên cần chọn nhiều, nên có bảng join course\_instructors trong Course Service DB, không dùng 1 field instructor\_id đơn.

### Course lessons gap {#course-lessons-gap}

Admin có thể POST thêm bài học nhưng học viên chưa có API GET để xem danh sách/nội dung bài. Đây là blocker P1 cho luồng học tập.

### Simulation result gap {#simulation-result-gap}

Học viên submit phiên mô phỏng tình huống nhưng thiếu GET /simulation/sessions/:id/result, khiến UX không xem được kết quả.

### Auth flow {#auth-flow}

POST /auth/forgot-password chỉ gửi email nhưng thiếu POST /auth/reset-password để nhận token và đặt mật khẩu mới, nên flow quên mật khẩu chưa hoàn chỉnh.