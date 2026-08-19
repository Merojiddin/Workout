/**
 * Vietnamese wording for the exercise guides, keyed by the exact English text.
 *
 * Keyed by phrase rather than by exercise so the lines the library generates
 * for every movement ("Keep each repetition consistent") are translated once
 * instead of 156 times. The `{name}` entries are the few templates that carry
 * the exercise's own name; see `translateExerciseText`.
 *
 * Movement names keep the widely used English term in brackets where Vietnamese
 * lifters normally say it that way -- "Hít xà (Pull-up)" is what a gym in
 * Vietnam actually calls it, and dropping the English would make the guide
 * harder to follow, not easier.
 */
export const exercisePhrasesVi: Record<string, string> = {
  // ------------------------------------------------------------------ names
  "Bench Press": "Đẩy ngực nằm (Bench Press)",
  "Weighted Push-up": "Chống đẩy có tạ",
  "Feet-elevated Push-up": "Chống đẩy kê chân cao",
  Dips: "Xà kép (Dips)",
  "Incline Dumbbell Press": "Đẩy tạ đơn ghế dốc lên",
  "Dumbbell Fly": "Ép ngực tạ đơn (Fly)",
  "Dumbbell Squeeze Press": "Đẩy tạ đơn ép sát",
  "Diamond Push-up": "Chống đẩy kim cương",
  "Paused Barbell Bench Press": "Đẩy ngực tạ đòn có dừng",
  "One-Arm Dumbbell Floor Press": "Đẩy tạ đơn một tay trên sàn",
  "Close-Grip Push-Up": "Chống đẩy tay hẹp",
  "Incline Barbell Press": "Đẩy tạ đòn ghế dốc lên",
  "Deficit Push-Up": "Chống đẩy hạ sâu",
  "Pull-up": "Hít xà (Pull-up)",
  "Weighted Pull-up": "Hít xà có tạ",
  "Chin-up": "Hít xà tay ngửa (Chin-up)",
  "Barbell Row": "Kéo tạ đòn (Barbell Row)",
  "One-arm Dumbbell Row": "Kéo tạ đơn một tay",
  "Inverted Row": "Kéo xà thấp (Inverted Row)",
  "Dumbbell Pullover": "Kéo tạ đơn qua đầu (Pullover)",
  "Shoulder-Width Pull-Up": "Hít xà tay rộng bằng vai",
  "Chest-Supported Dumbbell Row": "Kéo tạ đơn tựa ngực",
  "Weighted Chin-Up": "Hít xà tay ngửa có tạ",
  "Pendlay Row": "Kéo tạ đòn Pendlay",
  "Elbows-Out Dumbbell Row": "Kéo tạ đơn khuỷu mở rộng",
  "Dumbbell Shoulder Press": "Đẩy vai tạ đơn",
  "Pike Push-up": "Chống đẩy chữ V (Pike)",
  "Dumbbell Lateral Raise": "Nâng tạ đơn sang ngang",
  "Rear Delt Raise": "Nâng tạ vai sau",
  "Lean-Away Dumbbell Lateral Raise": "Nâng tạ sang ngang nghiêng người",
  "Prone Y-Raise": "Nâng tay chữ Y nằm sấp",
  "Standing One-Arm Dumbbell Overhead Press":
    "Đẩy tạ đơn một tay qua đầu, đứng",
  "Rear-Delt Dumbbell Row": "Kéo tạ đơn cho vai sau",
  "Barbell Curl": "Cuốn tạ đòn",
  "Dumbbell Curl": "Cuốn tạ đơn",
  "Hammer Curl": "Cuốn tạ búa (Hammer Curl)",
  "Triceps Extension": "Duỗi tay sau",
  "Skull Crusher": "Duỗi tay sau nằm (Skull Crusher)",
  "Incline Dumbbell Curl": "Cuốn tạ đơn ghế dốc",
  "Overhead Dumbbell Triceps Extension": "Duỗi tay sau qua đầu với tạ đơn",
  Squat: "Squat",
  "Romanian Deadlift": "Deadlift kiểu Romania",
  "Bulgarian Split Squat": "Squat chân sau kê cao (Bulgarian)",
  "Glute Bridge": "Nâng hông nằm (Glute Bridge)",
  "Hip Thrust": "Đẩy hông (Hip Thrust)",
  "Calf Raise": "Nhón bắp chân",
  "Front Squat": "Squat tạ trước ngực",
  "Single-Leg Romanian Deadlift": "Deadlift Romania một chân",
  "Dumbbell Step-Up": "Bước lên bục với tạ đơn",
  "Sliding Hamstring Curl": "Cuốn đùi sau trượt gót",
  "Seated Dumbbell Calf Raise": "Nhón bắp chân ngồi với tạ đơn",
  "Wall Tibialis Raise": "Nâng mũi chân tựa tường",
  "Sumo Deadlift": "Deadlift kiểu Sumo",
  "Dumbbell Reverse Lunge": "Lunge lùi với tạ đơn",
  "Heels-Elevated Goblet Squat": "Goblet Squat kê gót cao",
  "Single-Leg Hip Thrust": "Đẩy hông một chân",
  "Hanging Knee Raise": "Treo xà nâng gối",
  "Lying Leg Raise": "Nâng chân nằm ngửa",
  "Reverse Crunch": "Gập bụng ngược",
  Plank: "Plank",
  "Side Plank": "Plank nghiêng",
  "Hollow Body Hold": "Giữ tư thế thuyền (Hollow Body)",
  "Dead Bug": "Dead Bug",
  "Side-Plank Reach-Through": "Plank nghiêng luồn tay",
  "Hanging Leg Raise": "Treo xà nâng chân thẳng",
  "Kneeling Barbell Rollout": "Lăn tạ đòn quỳ gối",
  "Posterior Pelvic Tilt": "Nghiêng khung chậu ra sau",
  "Hip Flexor Stretch": "Giãn cơ gập hông",
  "Plank with Glute Squeeze": "Plank kèm siết cơ mông",
  "90/90 Hip Lift with Full Exhale": "Nâng hông 90/90 kèm thở ra hết",
  "Bird Dog with Pause": "Bird Dog có dừng",
  "Glute Bridge March": "Nâng hông kèm bước chân tại chỗ",
  "Couch Hip-Flexor Stretch": "Giãn cơ gập hông tựa ghế",
  "Treadmill Incline Walk": "Đi bộ dốc trên máy chạy",
  "Skipping Rope": "Nhảy dây",
  "VR Boxing": "Boxing thực tế ảo (VR)",
  "Suitcase Carry": "Xách tạ một bên đi bộ",
  "Easy Indoor Swimming": "Bơi nhẹ trong bể trong nhà",
  "Farmer Carry": "Xách tạ hai bên đi bộ",
  "Light Walking": "Đi bộ nhẹ",
  "Assisted Pull-Up": "Hít xà có hỗ trợ",
  "Neutral-Grip Lat Pulldown": "Kéo xô tay trung tính",
  "Neutral-Grip Pull-Up": "Hít xà tay trung tính",
  "Chest-Supported Machine Row": "Kéo máy tựa ngực",
  "Chest-Supported T-Bar Row": "Kéo T-Bar tựa ngực",
  "Seated Cable Row": "Kéo cáp ngồi",
  "Seated Machine Row": "Kéo máy ngồi",
  "One-Arm Cable Row": "Kéo cáp một tay",
  "One-Arm Machine Row": "Kéo máy một tay",
  "Incline-Bench Rear-Delt Dumbbell Raise": "Nâng tạ vai sau nằm sấp ghế dốc",
  "Reverse Pec Deck": "Máy ép ngực đảo chiều (vai sau)",
  "Cable Rear-Delt Fly": "Ép cáp cho vai sau",
  "Cable Lateral Raise": "Nâng cáp sang ngang",
  "Lateral Raise Machine": "Máy nâng vai sang ngang",
  "Supported Seated Dumbbell Press": "Đẩy tạ đơn ngồi có tựa lưng",
  "High-Incline One-Arm Dumbbell Press": "Đẩy tạ đơn một tay ghế dốc cao",
  "Landmine Press": "Đẩy Landmine",
  "Machine Shoulder Press": "Đẩy vai bằng máy",
  "Push-Up Plus": "Chống đẩy đẩy vai ra trước (Push-Up Plus)",
  "Light Band Face Pull": "Kéo dây kháng lực nhẹ về mặt",
  "Band Pull-Apart": "Kéo dãn dây kháng lực",
  "Wall Slide": "Trượt tay trên tường",
  "Bayesian Cable Curl": "Cuốn cáp kiểu Bayesian",
  "Preacher Curl": "Cuốn tạ ghế Preacher",
  "Cable Curl": "Cuốn cáp",
  "Rope Hammer Curl": "Cuốn dây thừng kiểu búa",
  "Resistance-Band Overhead Triceps Extension":
    "Duỗi tay sau qua đầu với dây kháng lực",
  "Cable Overhead Triceps Extension": "Duỗi tay sau qua đầu với cáp",
  "Resistance-Band Triceps Pressdown": "Đẩy tay sau xuống với dây kháng lực",
  "Cable Triceps Pressdown": "Đẩy tay sau xuống với cáp",
  "Countermovement Jump": "Bật nhảy có nhún xuống",
  "Box Jump": "Bật lên bục",
  "Heavy Goblet Squat": "Goblet Squat nặng",
  "Double-Dumbbell Squat": "Squat với hai tạ đơn",
  "Hack Squat": "Hack Squat",
  "Pendulum Squat": "Pendulum Squat",
  "Leg Press": "Đạp đùi (Leg Press)",
  "Smith Machine Squat": "Squat với máy Smith",
  "Smith Machine Bulgarian Split Squat": "Bulgarian Split Squat với máy Smith",
  "Leg Extension": "Duỗi gối trên máy",
  "Resistance-Band Leg Curl": "Cuốn đùi sau với dây kháng lực",
  "Seated Leg Curl": "Cuốn đùi sau ngồi",
  "Lying Leg Curl": "Cuốn đùi sau nằm sấp",
  "Weighted Single-Leg Calf Raise": "Nhón bắp chân một chân có tạ",
  "Standing Calf Machine Raise": "Nhón bắp chân đứng trên máy",
  "Seated Calf Machine Raise": "Nhón bắp chân ngồi trên máy",
  "Leg-Press Calf Raise": "Nhón bắp chân trên máy đạp đùi",
  "Dumbbell Romanian Deadlift": "Deadlift Romania với tạ đơn",
  "Smith Machine Romanian Deadlift": "Deadlift Romania với máy Smith",
  "Front-Foot-Elevated Dumbbell Reverse Lunge":
    "Lunge lùi với tạ đơn, kê cao chân trước",
  "Front-Foot-Elevated Smith Reverse Lunge":
    "Lunge lùi với máy Smith, kê cao chân trước",
  "Dumbbell Hip Thrust": "Đẩy hông với tạ đơn",
  "Smith Machine Hip Thrust": "Đẩy hông với máy Smith",
  "Hip-Thrust Machine": "Máy đẩy hông",
  "Suitcase Hold": "Giữ tạ một bên tại chỗ",
  "Captain's Chair Knee Raise": "Nâng gối trên ghế nâng chân",
  "High-Incline Dumbbell Press": "Đẩy tạ đơn ghế dốc cao",
  "Incline Smith Machine Press": "Đẩy máy Smith ghế dốc lên",
  "Incline Chest Press Machine": "Máy đẩy ngực dốc lên",
  "Dumbbell Bench Press": "Đẩy ngực nằm với tạ đơn",
  "Chest Press Machine": "Máy đẩy ngực",
  "Cable Fly": "Ép cáp cho ngực",
  "Pec Deck": "Máy ép ngực (Pec Deck)",
  "Resistance-Band Kneeling Crunch": "Gập bụng quỳ với dây kháng lực",
  "Cable Kneeling Crunch": "Gập bụng quỳ với cáp",
  "Resistance-Band Pallof Press": "Đẩy Pallof với dây kháng lực",
  "Cable Pallof Press": "Đẩy Pallof với cáp",
  "Boxing Footwork Drill": "Bài tập di chuyển chân boxing",
  Shadowboxing: "Đấm gió (Shadowboxing)",
  "Boxing Defense Drill": "Bài tập phòng thủ boxing",
  "Heavy-Bag Boxing": "Đấm bao cát",
  "Rotational Medicine-Ball Throw": "Ném bóng tạ xoay người",
  "Brisk Walking": "Đi bộ nhanh",
  "Chin Tuck": "Thu cằm",
  "Thoracic Extension / Reach": "Ưỡn ngực / vươn tay",
  "Four-Way Neck Isometric": "Giữ tĩnh cổ bốn hướng",

  // -------------------------------------------------------------- templates
  "Use a lighter {name} variation": "Dùng biến thể nhẹ hơn của {name}",
  "Learn {name} with a clearly manageable load":
    "Học {name} với mức tạ rõ ràng trong khả năng",
  "{name} exercise form demonstration": "Minh hoạ kỹ thuật bài {name}",
  "{name} exercise category placeholder": "Ảnh tạm theo nhóm bài của {name}",
  "Learn {name} in a small comfortable range":
    "Học {name} trong biên độ nhỏ và thoải mái",
  "Practice {name} slowly with consistent technique":
    "Tập {name} chậm rãi với kỹ thuật ổn định",
  "{name} animation": "Ảnh động bài {name}",
  "{name} with an underhand shoulder-width grip":
    "{name} với tay nắm ngửa rộng bằng vai",

  // --------------------------------------------------------------- content
  "Changing the range from repetition to repetition":
    "Thay đổi biên độ giữa các lần thực hiện",
  "Choose the simpler equipment alternative from the same workout slot":
    "Chọn phương án dụng cụ đơn giản hơn cho cùng vị trí bài tập trong buổi tập",
  "Continuing through sharp or unusual pain":
    "Tiếp tục tập khi có cơn đau nhói hoặc bất thường",
  "Keep each repetition consistent": "Giữ mỗi lần thực hiện đều nhau",
  "Leave the programmed repetitions in reserve":
    "Chừa số lần dự phòng đúng theo chương trình",
  "Reduce the range to a comfortable controlled range":
    "Giảm biên độ xuống mức thoải mái và có kiểm soát",
  "Use a smooth, controlled return to the start position.":
    "Trở về vị trí bắt đầu một cách nhịp nhàng và có kiểm soát.",
  "Use the full range that you can control comfortably":
    "Dùng hết biên độ mà bạn có thể kiểm soát thoải mái",
  "Using momentum instead of the target muscles":
    "Dùng quán tính thay vì các cơ mục tiêu",
  "Using more load than can be controlled":
    "Dùng mức tạ nặng hơn khả năng kiểm soát",
  "Keep the neck comfortable, ribs controlled, and spine neutral. Do not gain range by jutting the chin or over-arching the lower back.":
    "Giữ cổ thoải mái, xương sườn ổn định và cột sống trung lập. Không cố tăng biên độ bằng cách rướn cằm hoặc ưỡn quá mức lưng dưới.",
  "Add clean repetitions within the programmed range":
    "Thêm số lần thực hiện chuẩn trong phạm vi chương trình",
  "Increase by the smallest practical load increment":
    "Tăng theo nấc mức tạ nhỏ nhất có thể",
  "Reach the top of the range at the required RIR":
    "Đạt đầu trên của khoảng số lần với mức RIR yêu cầu",
  "Control the lowering": "Kiểm soát pha hạ xuống",
  "Push-up": "Chống đẩy",
  "Inverted row": "Kéo xà thấp",
  "Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Hạ xương sườn, siết bụng, siết nhẹ cơ mông và giữ cột sống trung lập. Không ưỡn quá mức lưng dưới. Dừng lại nếu xuất hiện đau nhói.",
  "Partial range of motion": "Biên độ chuyển động không đầy đủ",
  "Add range or light resistance without creating fatigue":
    "Tăng biên độ hoặc thêm lực cản nhẹ mà không gây mệt mỏi",
  "Build smooth, repeatable control":
    "Xây dựng khả năng kiểm soát mượt mà và ổn định",
  "Glute bridge": "Nâng hông nằm (Glute Bridge)",
  "Holding the breath": "Nín thở",
  "Incline push-up": "Chống đẩy dốc lên",
  "Dead bug": "Dead Bug",
  "Ribs down, abs tight": "Hạ xương sườn, siết chặt cơ bụng",
  "Rushing the reps": "Thực hiện các lần quá vội",
  "Arching the lower back": "Ưỡn lưng dưới",
  "Chest-supported row": "Kéo tạ tựa ngực",
  "Flaring the elbows wide": "Mở khuỷu tay quá rộng",
  "Lower slowly": "Hạ xuống chậm rãi",
  "Lower slowly under control.": "Hạ xuống chậm rãi và có kiểm soát.",
  "Bench dip": "Xà kép trên ghế (Bench Dip)",
  "Bodyweight squat": "Squat không tạ",
  "Build repeatable rounds or repetitions":
    "Tăng dần đến các vòng hoặc số lần có thể lặp lại ổn định",
  "Hanging knee raise": "Treo xà nâng gối",
  "Hips sagging toward the floor": "Để hông võng xuống sàn",
  "Increase duration or complexity only while quality stays high":
    "Chỉ tăng thời lượng hoặc độ phức tạp khi chất lượng vẫn tốt",
  "Keep ribs down": "Giữ xương sườn hạ xuống",
  "Keep the neck relaxed": "Giữ cổ thư giãn",
  "Keep the ribs down": "Giữ xương sườn hạ xuống",
  "Letting the hips sag": "Để hông võng xuống",
  "Negative pull-up": "Hít xà âm (Negative Pull-up)",
  "Pause at the top": "Dừng ở vị trí trên cùng",
  "Pike push-up": "Chống đẩy chữ V (Pike)",
  "Rear delt raise": "Nâng tạ vai sau",
  "Reverse crunch": "Gập bụng ngược",
  "Rushing the lowering phase": "Hạ xuống quá vội",
  "Band row": "Kéo dây kháng lực",
  "Barbell bench press": "Đẩy ngực nằm với tạ đòn",
  "Barbell row": "Kéo tạ đòn (Barbell Row)",
  "Bouncing at the bottom": "Nảy ở vị trí dưới cùng",
  "Bouncing out of the bottom": "Dùng đà nảy khỏi vị trí dưới cùng",
  "Close-grip push-up": "Chống đẩy tay hẹp",
  "Elbows drifting forward": "Để khuỷu tay trôi ra trước",
  "Incline dumbbell press": "Đẩy tạ đơn ghế dốc lên",
  "Knee plank": "Plank chống gối",
  "Knee push-up": "Chống đẩy chống gối",
  "Knee side plank": "Plank nghiêng chống gối",
  "Lower back arching off the floor": "Lưng dưới ưỡn khỏi sàn",
  "Lying leg raise": "Nâng chân nằm ngửa",
  "Negative chin-up": "Hít xà tay ngửa âm (Negative Chin-up)",
  "Pelvic tilt": "Nghiêng khung chậu",
  "Ribs down": "Hạ xương sườn",
  "Ribs down, abs braced": "Hạ xương sườn, siết cơ bụng",
  "Rounding the back": "Gù lưng",
  "Rounding the lower back": "Cong lưng dưới",
  "Seated dumbbell curl": "Cuốn tạ đơn ngồi",
  "Shrugging at the top": "Nhún vai ở vị trí trên cùng",
  "Shrugging the shoulders": "Nhún vai",
  "Stop 1-2 reps before form breaks": "Dừng trước khi kỹ thuật hỏng 1–2 lần",
  "Abs tight": "Siết chặt cơ bụng",
  "Arching and flaring the ribs": "Ưỡn lưng và bật xương sườn lên",
  "Band curl": "Cuốn tay với dây kháng lực",
  "Band pull-apart": "Kéo dãn dây kháng lực",
  "Band pushdown": "Đẩy dây kháng lực xuống",
  "Band-assisted chin-up": "Hít xà tay ngửa có dây hỗ trợ",
  "Band-assisted pull-up": "Hít xà có dây hỗ trợ",
  "Bouncing the bar off the chest": "Nảy thanh đòn khỏi ngực",
  "Brace before descending": "Siết thân người trước khi hạ xuống",
  "Brace the core and keep the ribs down.":
    "Siết cơ lõi và giữ xương sườn hạ xuống.",
  "Brace the torso and row one side without rotating.":
    "Siết thân người và kéo một bên mà không xoay người.",
  "Breathe steadily": "Thở đều",
  "Bring the arms together in an arc while the torso stays still.":
    "Khép hai tay theo đường vòng cung trong khi giữ thân người cố định.",
  "Bring the chest toward the bar without swinging.":
    "Đưa ngực về phía thanh xà mà không đung đưa.",
  "Chest-supported dumbbell row": "Kéo tạ đơn tựa ngực",
  "Choose a foot position that fits the fixed bar path and keep pressure even.":
    "Chọn vị trí chân phù hợp với quỹ đạo cố định của thanh đòn và giữ lực phân bố đều.",
  "Curl the pelvis toward the ribs and lower without swinging.":
    "Cuộn khung chậu về phía xương sườn rồi hạ xuống mà không đung đưa.",
  "Curl the ribs toward the pelvis instead of hinging at the hips.":
    "Cuộn xương sườn về phía khung chậu thay vì gập tại hông.",
  "Curl the ribs toward the pelvis while the hips stay nearly fixed.":
    "Cuộn xương sườn về phía khung chậu trong khi giữ hông gần như cố định.",
  "Cutting the range short": "Rút ngắn biên độ",
  "Do both sides evenly": "Tập đều cả hai bên",
  "Do not arch the lower back": "Không ưỡn lưng dưới",
  "Do not over-arch lower back": "Không ưỡn lưng dưới quá mức",
  "Do not swing": "Không đung đưa",
  "Drive through the front foot": "Dồn lực qua chân trước",
  "Drive through the heels": "Dồn lực qua gót chân",
  "Dropping the weight fast": "Hạ tạ quá nhanh",
  "Dumbbell curl": "Cuốn tạ đơn",
  "Dumbbell floor press": "Đẩy tạ đơn trên sàn",
  "Dumbbell lateral raise": "Nâng tạ đơn sang ngang",
  "Dumbbell row": "Kéo tạ đơn",
  "Feet-elevated weighted push-up": "Chống đẩy có tạ, kê chân cao",
  "Finish by gently spreading the shoulder blades without rounding the whole spine.":
    "Kết thúc bằng cách nhẹ nhàng tách hai bả vai mà không làm cong toàn bộ cột sống.",
  "Floor dumbbell fly": "Ép ngực tạ đơn trên sàn",
  "Glide the head straight back gently without looking down.":
    "Nhẹ nhàng đưa đầu thẳng ra sau mà không nhìn xuống.",
  "Glutes slightly squeezed": "Siết nhẹ cơ mông",
  "Goblet squat": "Goblet Squat",
  "Going too heavy": "Dùng mức tạ quá nặng",
  "Going too heavy and losing control": "Dùng mức tạ quá nặng và mất kiểm soát",
  "Going too long before conditioned": "Tập quá lâu khi thể lực chưa sẵn sàng",
  "Half reps": "Chỉ thực hiện nửa biên độ",
  "Half-kneeling stretch": "Giãn cơ ở tư thế quỳ một gối",
  "Hanging straight-leg raise": "Treo xà nâng chân thẳng",
  "Head dropping forward": "Để đầu chúi ra trước",
  "Heavier overhead extension": "Duỗi tay qua đầu với mức tạ nặng hơn",
  "Heels-elevated goblet squat": "Goblet Squat kê gót cao",
  "Hinge along the fixed bar path while keeping the bar close and spine neutral.":
    "Gập hông theo quỹ đạo cố định của thanh đòn, giữ thanh đòn sát người và cột sống trung tính.",
  "Hip hinge with dowel": "Gập hông với gậy",
  "Hip thrust": "Đẩy hông (Hip Thrust)",
  "Hold a stable torso and row without rocking backward.":
    "Giữ thân người ổn định và kéo mà không ngả người ra sau.",
  "Hold the dumbbell close, brace, and keep the knees tracking with the toes.":
    "Giữ tạ đơn sát người, siết thân và để đầu gối đi cùng hướng với mũi chân.",
  "Hold the upper arms still and extend without arching the lower back.":
    "Giữ bắp tay trên cố định và duỗi tay mà không ưỡn lưng dưới.",
  "Incline close-grip push-up": "Chống đẩy tay hẹp dốc lên",
  "Incline pike push-up": "Chống đẩy chữ V dốc lên",
  "Jump crisply and land quietly in balance; every rep is a fresh effort.":
    "Bật nhảy dứt khoát và tiếp đất nhẹ, thăng bằng; mỗi lần là một nỗ lực mới.",
  "Keep a neutral grip and curl the rope without moving the elbows forward.":
    "Giữ tay nắm trung tính và cuốn dây thừng mà không đưa khuỷu tay ra trước.",
  "Keep both dumbbells stable and descend with even foot pressure.":
    "Giữ hai tạ đơn ổn định và hạ xuống với lực bàn chân phân bố đều.",
  "Keep elbows near the ribs": "Giữ khuỷu tay gần xương sườn",
  "Keep shoulders away from the ears": "Giữ vai xa tai",
  "Keep the back on the pad and track the knees over the toes.":
    "Giữ lưng trên đệm và để đầu gối đi cùng hướng với mũi chân.",
  "Keep the back supported and press through a comfortable shoulder path.":
    "Giữ lưng được tựa và đẩy theo quỹ đạo thoải mái cho vai.",
  "Keep the bar padded and finish with level hips without over-arching.":
    "Bọc đệm thanh đòn và kết thúc với hông cân bằng mà không ưỡn quá mức.",
  "Keep the chest on the pad while the shoulder blades move naturally.":
    "Giữ ngực trên đệm trong khi bả vai di chuyển tự nhiên.",
  "Keep the chest supported and open the arms without shrugging.":
    "Giữ ngực tựa chắc và mở hai tay mà không nhún vai.",
  "Keep the chest supported and sweep light dumbbells out without shrugging.":
    "Giữ ngực tựa chắc và quét tạ đơn nhẹ ra ngoài mà không nhún vai.",
  "Keep the elbows fixed beside the torso and press without shoulder movement.":
    "Giữ khuỷu tay cố định sát thân và đẩy xuống mà không di chuyển vai.",
  "Keep the elbows still and curl without rocking the torso.":
    "Giữ khuỷu tay cố định và cuốn tạ mà không lắc thân người.",
  "Keep the entire front foot on the platform and step back under control.":
    "Giữ toàn bộ bàn chân trước trên bục và bước lùi có kiểm soát.",
  "Keep the hips on the pad and curl without lifting the pelvis.":
    "Giữ hông trên đệm và cuốn chân mà không nhấc khung chậu.",
  "Keep the hips on the seat and extend the knees without swinging.":
    "Giữ hông trên ghế và duỗi gối mà không đung đưa.",
  "Keep the hips quiet and curl the heels without arching the back.":
    "Giữ hông cố định và cuốn gót chân mà không ưỡn lưng.",
  "Keep the knees softly straight and pause at both ends of the ankle range.":
    "Giữ gối duỗi mềm và dừng ở cả hai đầu biên độ cổ chân.",
  "Keep the knees stable and move the platform only through the ankles.":
    "Giữ đầu gối ổn định và chỉ di chuyển bàn đạp bằng cổ chân.",
  "Keep the knees under the pad and move only through the ankles.":
    "Giữ đầu gối dưới đệm và chỉ chuyển động tại cổ chân.",
  "Keep the legs quiet": "Giữ chân cố định",
  "Keep the neck neutral": "Giữ cổ trung tính",
  "Keep the palms facing and drive the elbows down without swinging.":
    "Giữ hai lòng bàn tay hướng vào nhau và kéo khuỷu tay xuống mà không đung đưa.",
  "Keep the pelvis level": "Giữ khung chậu cân bằng",
  "Keep the pelvis on the pad and lower only as far as the back stays controlled.":
    "Giữ khung chậu trên đệm và chỉ hạ đến mức lưng vẫn được kiểm soát.",
  "Keep the ribs down and drive to level hips using the glutes.":
    "Giữ xương sườn hạ xuống và dùng cơ mông đẩy hông lên cân bằng.",
  "Keep the shoulder blades controlled and press the dumbbells evenly.":
    "Kiểm soát bả vai và đẩy hai tạ đơn đều nhau.",
  "Keep the stance balanced, move without crossing the feet, and reset after angles.":
    "Giữ thế đứng thăng bằng, di chuyển không bắt chéo chân và đặt lại tư thế sau mỗi góc.",
  "Keep the thighs secured and curl through a controlled full range.":
    "Cố định đùi và cuốn chân hết biên độ có kiểm soát.",
  "Keep the torso on the pad and lift through the elbows without shrugging.":
    "Giữ thân người trên đệm và nâng bằng khuỷu tay mà không nhún vai.",
  "Keep the torso on the pad and press through a comfortable incline path.":
    "Giữ thân người trên đệm và đẩy theo quỹ đạo dốc thoải mái.",
  "Keep the torso still": "Giữ thân người cố định",
  "Keep the torso supported and bring the pads together without shoulder roll.":
    "Giữ thân người được tựa và khép hai đệm lại mà không cuộn vai.",
  "Keep the torso supported and pull the elbows back without shrugging.":
    "Giữ thân người được tựa và kéo khuỷu tay ra sau mà không nhún vai.",
  "Keep the torso tall": "Giữ thân người thẳng cao",
  "Keep the upper arm behind the torso while curling without shoulder movement.":
    "Giữ bắp tay trên ở sau thân người khi cuốn cáp mà không di chuyển vai.",
  "Keep the upper arms on the pad and control the lengthened bottom position.":
    "Giữ bắp tay trên trên đệm và kiểm soát vị trí cơ giãn dài ở dưới cùng.",
  "Keep the upper arms steady and ribs down as the elbows straighten.":
    "Giữ bắp tay trên ổn định và xương sườn hạ xuống khi duỗi thẳng khuỷu tay.",
  "Keep the wrist stacked, recover the hands quickly, and prioritize clean mechanics.":
    "Giữ cổ tay thẳng hàng, thu tay về nhanh và ưu tiên kỹ thuật chuẩn.",
  "Keep upper arms still": "Giữ bắp tay trên cố định",
  "Keep wrists neutral": "Giữ cổ tay trung tính",
  "Keep wrists stacked over elbows": "Giữ cổ tay thẳng hàng trên khuỷu tay",
  "Knees collapsing inward": "Đầu gối đổ vào trong",
  "Lead with the elbow and keep cable tension without leaning back.":
    "Dẫn chuyển động bằng khuỷu tay và duy trì lực căng cáp mà không ngả ra sau.",
  "Letting the lower back arch": "Để lưng dưới ưỡn",
  "Lie on your back with the knees bent and feet flat.":
    "Nằm ngửa, gập gối và đặt bàn chân phẳng trên sàn.",
  "Light chest-supported row": "Kéo tạ nhẹ tựa ngực",
  "Light dumbbell pullover": "Pullover với tạ đơn nhẹ",
  "Long-lever plank": "Plank đòn bẩy dài",
  "Longer rounds": "Các vòng dài hơn",
  "Low step-up": "Bước lên bục thấp",
  "Lower all the way under control.": "Hạ hết biên độ có kiểm soát.",
  "Lower under control": "Hạ xuống có kiểm soát",
  "Lower under control to full elbow extension.":
    "Hạ xuống có kiểm soát đến khi khuỷu tay duỗi hoàn toàn.",
  "Machine press": "Đẩy máy",
  "Neutral spine head to heels": "Giữ cột sống trung tính từ đầu đến gót chân",
  "Normal push-up": "Chống đẩy thông thường",
  "One-arm dumbbell row": "Kéo tạ đơn một tay",
  "Only the forearms move": "Chỉ cẳng tay di chuyển",
  "Open the arms with the rear delts while the ribs and torso stay quiet.":
    "Dùng vai sau mở hai tay trong khi giữ xương sườn và thân người cố định.",
  "Over-arching at the top": "Ưỡn quá mức ở vị trí trên cùng",
  "Over-striding": "Bước sải quá dài",
  "Partial curl": "Cuốn tay một phần biên độ",
  "Partial raise": "Nâng một phần biên độ",
  "Pin the elbows near the ribs and press down without rocking.":
    "Giữ khuỷu tay sát xương sườn và đẩy xuống mà không lắc người.",
  "Plant the feet and set the shoulder blades back and down.":
    "Đặt chân vững và kéo bả vai ra sau, hạ xuống.",
  "Posterior pelvic tilt": "Nghiêng khung chậu ra sau",
  "Press back up by straightening the elbows.":
    "Đẩy người lên lại bằng cách duỗi thẳng khuỷu tay.",
  "Press straight out while resisting rotation toward the anchor.":
    "Đẩy thẳng ra trước đồng thời chống xoay về phía điểm neo.",
  "Press the lower back gently into the floor.":
    "Nhẹ nhàng ép lưng dưới xuống sàn.",
  "Press up and forward while keeping the ribs and pelvis stacked.":
    "Đẩy lên và ra trước trong khi giữ xương sườn thẳng hàng trên khung chậu.",
  "Prone Y hold": "Giữ tay chữ Y nằm sấp",
  "Pull lightly toward the face while keeping the neck long and ribs quiet.":
    "Kéo nhẹ về phía mặt trong khi giữ cổ dài và xương sườn ổn định.",
  "Pull the elbows down toward the ribs.":
    "Kéo khuỷu tay xuống về phía xương sườn.",
  "Pull the light band apart without flaring the ribs or shrugging.":
    "Kéo dãn dây kháng lực nhẹ mà không bật xương sườn hoặc nhún vai.",
  "Pull the neutral handles toward the upper chest without leaning back.":
    "Kéo tay cầm trung tính về phía ngực trên mà không ngả ra sau.",
  "Punch smoothly, recover the guard quickly, and stay balanced after combinations.":
    "Ra đòn mượt mà, nhanh chóng thu tay về thế thủ và giữ thăng bằng sau các tổ hợp đòn.",
  "Push the hips back and keep the dumbbells close to the legs.":
    "Đẩy hông ra sau và giữ tạ đơn sát chân.",
  "Pushing through the toes": "Dồn lực qua mũi chân",
  "Reach through the upper back while the ribs and pelvis remain controlled.":
    "Vươn qua lưng trên trong khi vẫn kiểm soát xương sườn và khung chậu.",
  "Reach upward smoothly while the ribs stay stacked and the neck stays relaxed.":
    "Vươn lên mượt mà trong khi giữ xương sườn thẳng hàng và cổ thư giãn.",
  "Reverse lunge": "Lunge lùi",
  "Ribs down between reps": "Hạ xương sườn giữa các lần",
  "Ribs down, core braced": "Hạ xương sườn, siết cơ lõi",
  "Rotate through the hips and trunk, release crisply, and reset every repetition.":
    "Xoay qua hông và thân người, thả bóng dứt khoát rồi đặt lại tư thế sau mỗi lần.",
  "Row with a top pause": "Kéo và dừng ở vị trí trên cùng",
  "Seated lateral raise": "Nâng tạ sang ngang khi ngồi",
  "Seated one-arm dumbbell press": "Đẩy tạ đơn một tay khi ngồi",
  "Secure the dumbbell at the hips and finish with the glutes, not the lower back.":
    "Giữ chắc tạ đơn trên hông và kết thúc bằng cơ mông, không dùng lưng dưới.",
  "Set the bench to match the fixed bar path and lower with control.":
    "Chỉnh ghế phù hợp với quỹ đạo cố định của thanh đòn và hạ xuống có kiểm soát.",
  "Set the shoulders down and away from the ears.":
    "Hạ vai xuống và giữ vai xa tai.",
  "Short range of motion": "Biên độ ngắn",
  "Shorter carry": "Quãng xách tạ ngắn hơn",
  "Shorter rounds": "Các vòng ngắn hơn",
  "Shorter walk": "Quãng đi bộ ngắn hơn",
  "Shrugging the shoulders up": "Nhún vai lên",
  "Single-leg glute bridge": "Nâng hông một chân",
  "Squeeze at the top": "Siết cơ ở vị trí trên cùng",
  "Squeeze press": "Đẩy tạ ép sát (Squeeze Press)",
  "Squeeze the biceps at the top.": "Siết cơ tay trước ở vị trí trên cùng.",
  "Stand tall and resist leaning toward or away from the load.":
    "Đứng thẳng cao và chống nghiêng về phía hoặc ra xa mức tạ.",
  "Start with shoulders down": "Bắt đầu với vai hạ xuống",
  "Static split squat": "Split Squat tại chỗ",
  "Static suitcase hold": "Giữ tạ một bên tại chỗ",
  "Stay against the backrest and press without flaring the ribs.":
    "Giữ người sát tựa lưng và đẩy mà không bật xương sườn.",
  "Stay against the pad and follow the machine arc with controlled knee tracking.":
    "Giữ người sát đệm, đi theo quỹ đạo máy và kiểm soát hướng đầu gối.",
  "Stay against the pad and press without shrugging or bouncing.":
    "Giữ người sát đệm và đẩy mà không nhún vai hoặc dùng đà nảy.",
  "Stay balanced under the bar and drive through the entire front foot.":
    "Giữ thăng bằng dưới thanh đòn và dồn lực qua toàn bộ bàn chân trước.",
  "Stay centered under the bar and drive through the elevated front foot.":
    "Giữ người ở giữa dưới thanh đòn và dồn lực qua chân trước kê cao.",
  "Stay light on the feet": "Giữ bước chân nhẹ nhàng",
  "Stay square against the support and row one arm without twisting.":
    "Giữ thân người vuông với điểm tựa và kéo một tay mà không vặn người.",
  "Stay square on the high incline and resist rotating as one arm presses.":
    "Giữ thân người ngay ngắn trên ghế dốc cao và chống xoay khi đẩy một tay.",
  "Stay square while pressing the cable away from the chest.":
    "Giữ thân người ngay ngắn khi đẩy cáp ra xa ngực.",
  "Stay supported and row the handles without bouncing off the pad.":
    "Giữ người tựa chắc và kéo tay cầm mà không nảy khỏi đệm.",
  "Stay supported on the high incline and press without flaring the ribs.":
    "Giữ người tựa chắc trên ghế dốc cao và đẩy mà không bật xương sườn.",
  "Supported calf raise": "Nhón bắp chân có điểm tựa",
  "Swinging for momentum": "Đung đưa để lấy đà",
  "Swinging the body for momentum": "Đung đưa cơ thể để lấy đà",
  "Swinging the legs for momentum": "Đung đưa chân để lấy đà",
  "Toes-to-bar": "Nâng mũi chân chạm xà (Toes-to-Bar)",
  "Track the knees with the toes": "Giữ đầu gối đi cùng hướng với mũi chân",
  "Tuck hold": "Giữ tư thế co gối (Tuck Hold)",
  "Tuck the ribs down and brace the abs.":
    "Thu xương sườn xuống và siết cơ bụng.",
  "Two-arm dumbbell floor press": "Đẩy tạ đơn hai tay trên sàn",
  "Unrack with the wrists stacked over the elbows.":
    "Nhấc tạ khỏi giá với cổ tay thẳng hàng trên khuỷu tay.",
  "Use a conservative box, land fully on top, and step down between reps.":
    "Chọn bục có độ cao vừa sức, tiếp đất hoàn toàn trên bục và bước xuống giữa các lần.",
  "Use easy hand resistance and keep the head still in every direction.":
    "Dùng lực cản nhẹ từ tay và giữ đầu cố định theo mọi hướng.",
  "Use only enough assistance for controlled full-range repetitions.":
    "Chỉ dùng mức hỗ trợ vừa đủ để thực hiện hết biên độ có kiểm soát.",
  "Use short rounds": "Tập các vòng ngắn",
  "Use small controlled slips, rolls, pivots, and exits while staying in stance.":
    "Thực hiện các động tác né, luồn, xoay trụ và thoát góc nhỏ có kiểm soát trong khi giữ thế đứng.",
  "Use support for balance and move one ankle through a full controlled range.":
    "Dùng điểm tựa để giữ thăng bằng và đưa từng cổ chân qua hết biên độ có kiểm soát.",
  "Using too much weight": "Dùng mức tạ quá nặng",
  "Walk tall at a sustainable conversational pace with a natural stride.":
    "Đi thẳng người ở tốc độ vẫn trò chuyện được và duy trì thoải mái, với sải chân tự nhiên.",
  "Weighted pull-up": "Hít xà có tạ",
  "90/90 hip lift": "Nâng hông 90/90",
  "90/90 hip lift with reach": "Nâng hông 90/90 kèm vươn tay",
  "A cornerstone anti-arch exercise: it teaches you to keep a neutral, flat lower back while the limbs move.":
    "Một bài nền tảng chống ưỡn lưng: bài này dạy bạn giữ lưng dưới phẳng và trung tính trong khi tay chân di chuyển.",
  "A great arched-back drill: keep ribs down and lift with the glutes, not the lower back. Do not hyperextend at the top.":
    "Một bài rất tốt để sửa lưng ưỡn: giữ xương sườn hạ xuống và nâng bằng cơ mông, không dùng lưng dưới. Không ưỡn quá mức ở vị trí trên cùng.",
  "A key anti-arch drill. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Một bài quan trọng để chống ưỡn lưng. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Abs tight, ribs down": "Siết chặt cơ bụng, hạ xương sườn",
  "Add load only once bodyweight pull-ups are clean and full range.":
    "Chỉ thêm tạ khi đã hít xà không tạ đúng kỹ thuật và hết biên độ.",
  "Add overhead reach": "Thêm động tác vươn tay qua đầu",
  "Add weight slowly over time": "Tăng tạ từ từ theo thời gian",
  "Adding load before bodyweight reps are solid":
    "Thêm tạ khi các lần không tạ chưa vững",
  "Adding weight before clean bodyweight reps":
    "Thêm tạ trước khi thực hiện tốt các lần không tạ",
  "Adjust the machine and place the feet where the full foot stays planted through the arc.":
    "Chỉnh máy và đặt chân sao cho toàn bộ bàn chân luôn áp chắc trong suốt quỹ đạo.",
  "Adjust the machine belt or pad securely across the hips and plant both feet.":
    "Chỉnh đai hoặc đệm máy chắc chắn ngang hông và đặt vững cả hai chân.",
  "Adjust the preacher seat so the armpits rest comfortably near the top of the pad.":
    "Chỉnh ghế Preacher để nách tựa thoải mái gần mép trên của đệm.",
  "Adjust the seat and chest pad so the handles begin just beyond arm length.":
    "Chỉnh ghế và đệm ngực để tay cầm bắt đầu ngay ngoài tầm với của tay.",
  "Adjust the seat and handles so the shoulders can reach forward comfortably.":
    "Chỉnh ghế và tay cầm để vai có thể vươn ra trước thoải mái.",
  "Adjust the seat and start position so the upper arms are supported comfortably.":
    "Chỉnh ghế và vị trí bắt đầu để bắp tay trên được đỡ thoải mái.",
  "Adjust the seat or chest pad and take one handle with the free hand braced.":
    "Chỉnh ghế hoặc đệm ngực, nắm một tay cầm và dùng tay còn lại làm điểm tựa.",
  "Adjust the seat so the handles align around mid-chest and the feet are stable.":
    "Chỉnh ghế để tay cầm ngang giữa ngực và hai chân ổn định.",
  "Adjust the seat so the handles align near shoulder height and brace the chest on the pad.":
    "Chỉnh ghế để tay cầm gần ngang vai và tựa chắc ngực vào đệm.",
  "Adjust the seat so the handles begin around shoulder height with the back supported.":
    "Chỉnh ghế để tay cầm bắt đầu gần ngang vai và lưng được tựa.",
  "Adjust the seat so the handles begin around the upper chest with the back fully supported.":
    "Chỉnh ghế để tay cầm bắt đầu gần ngực trên và toàn bộ lưng được tựa.",
  "Adjust the seat so the machine pivot aligns with the shoulders.":
    "Chỉnh ghế để trục xoay của máy thẳng hàng với vai.",
  "Aim toward the upper ribs": "Hướng về phía xương sườn trên",
  "Align the knees with the machine pivot and secure the thigh pad comfortably.":
    "Đặt đầu gối thẳng hàng với trục xoay của máy và cố định đệm đùi vừa vặn.",
  "Align the machine pivot with the knee and place the shin pad above the ankles.":
    "Đặt trục xoay của máy thẳng hàng với đầu gối và đặt đệm cẳng chân phía trên cổ chân.",
  "Alternating 90/90 heel pressure": "Luân phiên ấn gót ở tư thế 90/90",
  "Alternating curl": "Cuốn tay luân phiên",
  "Alternating dumbbell curl": "Cuốn tạ đơn luân phiên",
  "Alternating heel lift": "Nâng gót luân phiên",
  "Anchor a band securely overhead and kneel while holding it beside the head.":
    "Neo chắc dây kháng lực ở trên cao, quỳ xuống và giữ dây bên cạnh đầu.",
  "Anchor a light band around face height and step back until it is gently tensioned.":
    "Neo dây kháng lực nhẹ ngang tầm mặt và bước lùi đến khi dây hơi căng.",
  "Anchor the band near chest height and stand side-on in a balanced stance.":
    "Neo dây ngang tầm ngực và đứng nghiêng bên với tư thế thăng bằng.",
  "Anchor the band securely and attach it around the ankles in a stable lying position.":
    "Neo chắc dây và quấn quanh cổ chân trong tư thế nằm ổn định.",
  "Anchor the band securely overhead and hold it with the elbows bent beside the torso.":
    "Neo chắc dây ở trên cao và giữ dây với khuỷu tay gập sát thân.",
  "Animated barbell bench press demonstration":
    "Minh họa động tác đẩy ngực nằm với tạ đòn",
  "Animated dumbbell lateral raise demonstration":
    "Minh họa động tác nâng tạ đơn sang ngang",
  "Animated goblet squat demonstration": "Minh họa động tác Goblet Squat",
  "Animated pull-up demonstration": "Minh họa động tác hít xà",
  "Arching the back off the bench": "Ưỡn lưng khỏi ghế",
  "Arching the lower back at the top": "Ưỡn lưng dưới ở vị trí trên cùng",
  "Arching the lower back for more range": "Ưỡn lưng dưới để tăng biên độ",
  "Arching the lower back instead of tucking":
    "Ưỡn lưng dưới thay vì cuộn khung chậu",
  "Arching the lower back off the bench": "Ưỡn lưng dưới khỏi ghế",
  "Arching the lower back overhead": "Ưỡn lưng dưới khi đưa tay qua đầu",
  "Arching the lower back to press": "Ưỡn lưng dưới để đẩy",
  "Arching to lift the leg higher": "Ưỡn lưng để nâng chân cao hơn",
  "Arm-only bird dog": "Bird Dog chỉ dùng tay",
  "Arm-only or leg-only bird dog": "Bird Dog chỉ dùng tay hoặc chỉ dùng chân",
  "Assisted dip": "Xà kép có hỗ trợ",
  "Assisted pull-up on a counterweighted machine":
    "Hít xà có hỗ trợ trên máy đối trọng",
  "Assisted shoulder-width pull-up": "Hít xà tay rộng bằng vai có hỗ trợ",
  "Assisted split squat": "Split Squat có hỗ trợ",
  "Assisted squat": "Squat có hỗ trợ",
  "Attach a bar or rope to a high cable and stand with the elbows close to the ribs.":
    "Gắn thanh hoặc dây thừng vào cáp cao và đứng với khuỷu tay sát xương sườn.",
  "Attach a rope to a low cable and hold it with the palms facing each other.":
    "Gắn dây thừng vào cáp thấp và giữ sao cho hai lòng bàn tay hướng vào nhau.",
  "Attach the selected handle to a low cable and stand tall with the arms extended.":
    "Gắn tay cầm đã chọn vào cáp thấp và đứng thẳng cao với hai tay duỗi.",
  "Avoid bouncing or relaxing suddenly at the bottom of the curl.":
    "Tránh dùng đà nảy hoặc thả lỏng đột ngột ở vị trí dưới cùng của động tác cuốn.",
  "Avoid exaggerated head or neck motion and keep the drills submaximal.":
    "Tránh cử động đầu hoặc cổ quá mức và luôn tập dưới mức tối đa.",
  "Avoid forcing a deep start position that rolls the shoulders forward.":
    "Tránh ép vị trí bắt đầu quá sâu khiến vai cuộn ra trước.",
  "Avoid forcing the handles behind a comfortable shoulder range.":
    "Tránh ép tay cầm ra sau quá biên độ thoải mái của vai.",
  "Avoid lifting the chest or head from the pad to gain range.":
    "Tránh nhấc ngực hoặc đầu khỏi đệm để tăng biên độ.",
  "Avoid snapping the elbows or exaggerating neck and head movement.":
    "Tránh giật khuỷu tay hoặc cử động cổ và đầu quá mức.",
  "Avoid swinging": "Tránh đung đưa",
  "Back squat with the bar on the upper back":
    "Back Squat với thanh đòn đặt trên lưng trên",
  "Back stays flat while an opposite arm and leg reach out.":
    "Giữ lưng phẳng khi vươn tay và chân đối diện ra.",
  "Backpack sliding": "Ba lô bị trượt",
  "Backpack sliding around": "Ba lô trượt qua lại",
  "Band hammer curl": "Cuốn tay kiểu búa với dây kháng lực",
  "Band press": "Đẩy với dây kháng lực",
  "Band pulled apart across the chest with straight arms":
    "Kéo dãn dây ngang ngực với hai tay thẳng",
  "Band pulled toward the face with the elbows high":
    "Kéo dây về phía mặt với khuỷu tay cao",
  "Band pullover": "Pullover với dây kháng lực",
  "Band-assisted dip": "Xà kép có dây hỗ trợ",
  "Bar drifting away from the legs": "Thanh đòn trôi ra xa chân",
  "Bar higher (more upright)": "Đặt xà cao hơn (thân người thẳng hơn)",
  "Barbell bench press animation": "Ảnh động đẩy ngực nằm với tạ đòn",
  "Barbell curl": "Cuốn tạ đòn",
  "Barbell curl with slow eccentric": "Cuốn tạ đòn với pha hạ chậm",
  "Barbell RDL": "RDL với tạ đòn",
  "Barbell skull crusher": "Skull Crusher với tạ đòn",
  "Barbell squat with knees tracking over toes":
    "Squat tạ đòn với đầu gối đi cùng hướng mũi chân",
  "Barbell sumo deadlift": "Sumo Deadlift với tạ đòn",
  "Basic skip": "Nhảy dây cơ bản",
  "Begin from a controlled hang and set the shoulders down.":
    "Bắt đầu từ tư thế treo có kiểm soát và hạ vai xuống.",
  "Begin in a balanced guard and select one defensive response to practice at a time.":
    "Bắt đầu ở thế thủ thăng bằng và mỗi lần chọn một phản xạ phòng thủ để tập.",
  "Begin with a short easy walk": "Bắt đầu bằng một quãng đi bộ nhẹ, ngắn",
  "Begin with brief ten-second easy holds":
    "Bắt đầu bằng các lần giữ nhẹ trong mười giây",
  "Bend the elbows to lower the weight toward the forehead.":
    "Gập khuỷu tay để hạ tạ về phía trán.",
  "Bend the knees against the band, pause, and extend slowly without losing tension.":
    "Gập gối chống lại lực dây, dừng lại rồi duỗi chậm mà không làm mất lực căng.",
  "Bending and straightening the elbows": "Gập và duỗi khuỷu tay",
  "Bending the elbows into a row": "Gập khuỷu tay thành động tác kéo",
  "Bending the wrist backward": "Bẻ cổ tay ra sau",
  "Bending the wrists": "Gập cổ tay",
  "Bent-knee inverted row": "Kéo xà thấp với gối gập",
  "Bent-knee leg raise": "Nâng chân với gối gập",
  "Bent-knee raise": "Nâng gối gập",
  "Bent-leg hanging raise": "Treo xà nâng chân gập",
  "Bent-over barbell row with a flat back":
    "Kéo tạ đòn cúi người với lưng phẳng",
  "Bent-over rear delt raise with light dumbbells":
    "Nâng tạ vai sau cúi người với tạ đơn nhẹ",
  "Big arm swings instead of wrist turns":
    "Vung tay quá lớn thay vì xoay cổ tay",
  "Bird dog": "Bird Dog",
  "Bird dog with elbow-to-knee return": "Bird Dog thu khuỷu tay chạm gối",
  "Bird dog with pause": "Bird Dog có dừng",
  "Block sumo deadlift": "Sumo Deadlift kê cao tạ",
  "Body in one straight line": "Giữ cơ thể thành một đường thẳng",
  "Body in one straight line, do not let the lower back sag.":
    "Giữ cơ thể thành một đường thẳng, không để lưng dưới võng xuống.",
  "Body straight, pull the chest to the bar, squeeze the blades.":
    "Giữ người thẳng, kéo ngực về phía xà và siết hai bả vai.",
  "Bodyweight calf raise": "Nhón bắp chân không tạ",
  "Bodyweight dip": "Xà kép không tạ",
  "Bodyweight heels-elevated squat": "Squat không tạ kê gót cao",
  "Bodyweight hip thrust": "Đẩy hông không tạ",
  "Bodyweight reverse lunge": "Lunge lùi không tạ",
  "Bodyweight seated calf raise": "Nhón bắp chân ngồi không tạ",
  "Bodyweight single-leg hip thrust": "Đẩy hông một chân không tạ",
  "Bodyweight split squat": "Split Squat không tạ",
  "Bodyweight step-up": "Bước lên bục không tạ",
  "Bounce without the rope": "Nhảy nảy không dùng dây",
  "Bouncing deeper into the stretch": "Nảy sâu hơn vào tư thế giãn",
  "Bouncing in the stretch": "Dùng đà nảy khi giãn cơ",
  "Bouncing instead of pausing": "Dùng đà nảy thay vì dừng lại",
  "Bouncing the bar between reps": "Nảy thanh đòn giữa các lần",
  "Box squat": "Box Squat",
  "Boxing guard position for slips and rolls":
    "Thế thủ boxing để tập né và luồn",
  "Boxing stance moving on the balls of the feet":
    "Di chuyển ở thế đứng boxing trên phần trước bàn chân",
  "Boxing stance with the guard up in front of a target":
    "Thế đứng boxing, giơ tay thủ trước mục tiêu",
  "Boxing stance with the guard up, throwing punches at air":
    "Thế đứng boxing, giơ tay thủ và đấm vào không khí",
  "Brace against rotation and press with the wrist over the elbow.":
    "Siết thân chống xoay và đẩy với cổ tay thẳng hàng trên khuỷu tay.",
  "Brace and keep a neutral spine top to bottom. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Siết thân và giữ cột sống trung tính từ trên xuống dưới. Hạ xương sườn, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Brace before each repetition": "Siết thân trước mỗi lần",
  "Brace before every press": "Siết thân trước mỗi lần đẩy",
  "Brace before every rep": "Siết thân trước mỗi lần",
  "Brace before lifting and keep the spine neutral as the hips and shoulders rise together. Lock out with the glutes, not a backward lean.":
    "Siết thân trước khi nâng và giữ cột sống trung tính khi hông và vai cùng đi lên. Khóa động tác bằng cơ mông, không ngả người ra sau.",
  "Brace before lifting one foot a few centimetres from the floor.":
    "Siết thân trước khi nhấc một chân lên cách sàn vài xen-ti-mét.",
  "Brace before pressing and finish overhead without leaning away.":
    "Siết thân trước khi đẩy và kết thúc qua đầu mà không nghiêng người sang bên.",
  "Brace before the bar leaves the floor":
    "Siết thân trước khi thanh đòn rời sàn",
  "Brace every rep, knees track the toes, stay mid-foot.":
    "Siết thân mỗi lần, giữ đầu gối cùng hướng mũi chân và trọng tâm giữa bàn chân.",
  "Brace hard and keep a neutral spine while hinged. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Siết thân chắc và giữ cột sống trung tính khi gập hông. Hạ xương sườn, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Brace into a straight line from head to heels.":
    "Siết thân để tạo một đường thẳng từ đầu đến gót chân.",
  "Brace lightly and walk with short steady steps.":
    "Siết thân nhẹ và đi bằng các bước ngắn, đều.",
  "Brace lightly with the spine in a neutral position.":
    "Siết thân nhẹ với cột sống ở vị trí trung tính.",
  "Brace nearly parallel to the floor and pull each dead-stop rep without rising.":
    "Siết thân gần song song với sàn và kéo từng lần từ trạng thái tạ dừng hẳn mà không nâng thân lên.",
  "Brace one hand and knee on a bench.": "Chống một tay và một gối lên ghế.",
  "Brace the abdomen and keep the load still so it does not pull the ribs forward or swing the lower back.":
    "Siết bụng và giữ tạ đứng yên để tạ không kéo xương sườn ra trước hoặc làm lưng dưới đung đưa.",
  "Brace the abdomen and point the elbows forward.":
    "Siết bụng và hướng khuỷu tay ra trước.",
  "Brace the abdomen and stack the wrist over the elbow.":
    "Siết bụng và giữ cổ tay thẳng hàng trên khuỷu tay.",
  "Brace the abs and gently tuck the pelvis before lifting.":
    "Siết cơ bụng và nhẹ nhàng cuộn khung chậu trước khi nâng.",
  "Brace the core": "Siết cơ lõi",
  "Brace the core and drive through the planted foot to raise the hips.":
    "Siết cơ lõi và dồn lực qua chân trụ để nâng hông.",
  "Brace the core and keep ribs down so you do not lean back or arch to swing the weight up.":
    "Siết cơ lõi và hạ xương sườn để không ngả hoặc ưỡn lưng lấy đà đưa tạ lên.",
  "Brace the core and lift the hips into a low bridge.":
    "Siết cơ lõi và nâng hông lên tư thế cầu thấp.",
  "Brace the core and squeeze the glutes.": "Siết cơ lõi và cơ mông.",
  "Brace the core before descending.": "Siết cơ lõi trước khi hạ xuống.",
  "Brace the core before the first rep.": "Siết cơ lõi trước lần đầu tiên.",
  "Brace the core so hips stay in line with shoulders.":
    "Siết cơ lõi để hông luôn thẳng hàng với vai.",
  "Brace the core so the weight does not pull you into a swing. Ribs down, neutral spine.":
    "Siết cơ lõi để tạ không kéo cơ thể đung đưa. Hạ xương sườn, giữ cột sống trung tính.",
  "Brace the core, no swing": "Siết cơ lõi, không đung đưa",
  "Brace the hinge with a long neutral spine; do not round or over-arch to move the dumbbells. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Siết chắc tư thế gập hông với cột sống dài, trung tính; không cong hoặc ưỡn quá mức để di chuyển tạ đơn. Hạ xương sườn, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Brace the obliques and keep the ribs down.":
    "Siết cơ liên sườn và giữ xương sườn hạ xuống.",
  "Brace the torso and let the dumbbells hang below the shoulders.":
    "Siết thân người và để tạ đơn treo dưới vai.",
  "Brace the upper back on a bench and hold a padded dumbbell securely across the hips.":
    "Tựa chắc lưng trên vào ghế và giữ tạ đơn có đệm an toàn ngang hông.",
  "Brace with a neutral spine while the bar rests motionless.":
    "Siết thân với cột sống trung tính khi thanh đòn đang nằm yên.",
  "Brace, push the knees out, and drive the floor away.":
    "Siết thân, đẩy đầu gối ra ngoài và đạp sàn ra xa.",
  "Brace, then reach the free leg back as the torso hinges forward.":
    "Siết thân, sau đó vươn chân tự do ra sau khi thân người gập về trước tại hông.",
  "Breathe out as you extend": "Thở ra khi duỗi",
  "Breathe out during the reach": "Thở ra khi vươn",
  "Breathe slowly": "Thở chậm",
  "Breathe slowly, then change sides.": "Thở chậm, sau đó đổi bên.",
  "Breathe throughout": "Duy trì nhịp thở suốt động tác",
  "Breathing drill": "Bài tập thở",
  "Bridge weight shift": "Chuyển trọng lượng ở tư thế nâng hông",
  "Brief moderate intervals on a training day":
    "Các quãng cường độ vừa, ngắn trong ngày tập",
  "Bring the arms together, squeeze briefly, and return to a controlled stretch.":
    "Khép hai tay lại, siết nhẹ rồi trở về vị trí giãn có kiểm soát.",
  "Bring the knees toward the chest.": "Đưa đầu gối về phía ngực.",
  "Brisk walking at a conversational-plus pace":
    "Đi bộ nhanh ở tốc độ nhỉnh hơn mức trò chuyện",
  "Build consistent sets of three clean jumps":
    "Tăng dần đến các hiệp ba lần nhảy đúng kỹ thuật và ổn định",
  "Build consistent sets of three crisp repetitions":
    "Tăng dần đến các hiệp ba lần dứt khoát và ổn định",
  "Build repeatable sets of four to six crisp throws per side":
    "Tăng dần đến các hiệp bốn đến sáu lần ném dứt khoát mỗi bên, có thể lặp lại ổn định",
  "Build to a brisk but controlled rhythm while keeping the shoulders relaxed.":
    "Tăng dần đến nhịp nhanh nhưng có kiểm soát trong khi giữ vai thư giãn.",
  "Build toward the programmed hold duration":
    "Tăng dần đến thời gian giữ theo chương trình",
  "Build toward thirty minutes at a conversational pace":
    "Tăng dần đến ba mươi phút ở tốc độ vẫn trò chuyện được",
  "Build toward two controlled twenty-second holds per direction":
    "Tăng dần đến hai lần giữ có kiểm soát, mỗi lần hai mươi giây cho mỗi hướng",
  "Bulgarian split squat": "Bulgarian Split Squat",
  "Bulgarian split squat with rear foot on a bench":
    "Bulgarian Split Squat với chân sau đặt trên ghế",
  "Cable curl with the arm behind the body":
    "Cuốn cáp với tay ở sau thân người",
  "Cable fly bringing the handles together in front of the chest":
    "Ép cáp, khép tay cầm lại trước ngực",
  "Cable overhead triceps extension facing away from the stack":
    "Duỗi tay sau qua đầu với cáp, quay lưng về phía chồng tạ",
  "Cable triceps pressdown to a straight-arm finish":
    "Đẩy tay sau xuống với cáp đến khi tay duỗi thẳng",
  "Cable/band fly": "Ép ngực với cáp/dây kháng lực",
  "Calf raise pressing the platform with the balls of the feet":
    "Nhón bắp chân bằng cách ấn bàn đạp bằng phần trước bàn chân",
  "Captain-chair knee raise": "Nâng gối trên ghế nâng chân",
  "Carry equal loads with level shoulders and short steady steps.":
    "Xách mức tạ bằng nhau, giữ vai cân bằng và đi các bước ngắn, đều.",
  "Center an incline bench beneath the Smith bar and set the safeties above the chest.":
    "Đặt ghế dốc ở giữa dưới thanh máy Smith và chỉnh chốt an toàn cao hơn ngực.",
  "Changing the body angle to swing the weight":
    "Thay đổi góc cơ thể để lấy đà đưa tạ",
  "Check bench stability and do not finish by extending the neck or lower back.":
    "Kiểm tra độ chắc chắn của ghế và không kết thúc bằng cách ưỡn cổ hoặc lưng dưới.",
  "Check support stability first": "Kiểm tra độ chắc chắn của điểm tựa trước",
  "Check the anchor and keep the band clear of the face.":
    "Kiểm tra điểm neo và giữ dây tránh xa mặt.",
  "Check the anchor before every set and keep the band away from the face.":
    "Kiểm tra điểm neo trước mỗi hiệp và giữ dây tránh xa mặt.",
  "Check the band and anchor for damage before every set.":
    "Kiểm tra dây và điểm neo xem có hư hỏng trước mỗi hiệp.",
  "Chest dips on parallel bars with a slight forward lean":
    "Xà kép tập ngực trên hai thanh song song với thân hơi nghiêng về trước",
  "Chest tall, ribs down": "Nâng ngực, hạ xương sườn",
  "Chest-supported elbows-out row": "Kéo tạ tựa ngực với khuỷu tay mở",
  "Chest-supported machine row worked one arm at a time":
    "Kéo máy tựa ngực, tập lần lượt từng tay",
  "Chest-supported raise": "Nâng tạ tựa ngực",
  "Chest-supported rear delt raise": "Nâng tạ vai sau tựa ngực",
  "Chest-supported rear-delt row": "Kéo tạ vai sau tựa ngực",
  "Chin poking forward instead of chest up":
    "Đưa cằm ra trước thay vì nâng ngực",
  "Choose a comfortable stroke and a conversational effort.":
    "Chọn kiểu bơi thoải mái và mức gắng sức vẫn trò chuyện được.",
  "Choose a flat route when fatigued": "Chọn tuyến đường bằng phẳng khi mệt",
  "Choose a flat, comfortable route or walking surface.":
    "Chọn tuyến đường hoặc bề mặt đi bộ bằng phẳng, thoải mái.",
  "Choose a load that does not pull the hips or shoulders out of alignment.":
    "Chọn mức tạ không kéo hông hoặc vai lệch khỏi vị trí thẳng hàng.",
  "Choose a load you can control without leaning":
    "Chọn mức tạ bạn có thể kiểm soát mà không nghiêng người",
  "Choose a safe route or flat walking surface and begin at an easy pace.":
    "Chọn tuyến đường an toàn hoặc bề mặt đi bộ bằng phẳng và bắt đầu với tốc độ nhẹ.",
  "Choose a stable non-slip box that does not require an extreme knee tuck.":
    "Chọn bục chắc chắn, chống trượt và không buộc bạn phải co gối quá cao.",
  "Choose the loading position that keeps the wrists, shoulders, and back comfortable.":
    "Chọn vị trí đặt tạ giúp cổ tay, vai và lưng thoải mái.",
  "Clear a safe space and set your VR guardian boundary.":
    "Dọn một khoảng trống an toàn và thiết lập ranh giới Guardian cho VR.",
  "Close-grip knee push-up": "Chống đẩy tay hẹp chống gối",
  "Close/neutral-grip lat pulldown at a cable station":
    "Kéo xô tay hẹp/trung tính trên máy cáp",
  "Collapsing into the supporting shoulder": "Dồn sụp vào vai trụ",
  "Collapsing the chest forward": "Để ngực sụp ra trước",
  "Complete the push-up, then push the floor away slightly farther as the shoulder blades wrap forward.":
    "Hoàn thành lần chống đẩy, sau đó đẩy sàn ra xa thêm một chút khi bả vai ôm ra trước.",
  "Complete the repetitions, then switch sides.":
    "Hoàn thành số lần rồi đổi bên.",
  "Confirm the barbell plates roll securely and kneel on a mat.":
    "Đảm bảo bánh tạ lăn ổn định rồi quỳ trên thảm.",
  "Confirm the hooks and safety height can be reached from the lunge stance.":
    "Đảm bảo có thể chạm tới móc và chốt an toàn từ tư thế lunge.",
  "Confirm the hooks can be engaged safely from the split stance.":
    "Đảm bảo có thể gài móc an toàn từ tư thế chân trước chân sau.",
  "Constant inward squeeze": "Duy trì lực ép vào trong",
  "Continuing after technique breaks down": "Tiếp tục sau khi kỹ thuật đã hỏng",
  "Continuing after the grip fails": "Tiếp tục sau khi lực nắm đã mất",
  "Continuous easy swimming": "Bơi nhẹ liên tục",
  "Control both directions": "Kiểm soát cả hai chiều",
  "Control the bottom position": "Kiểm soát vị trí dưới cùng",
  "Control the depth": "Kiểm soát độ sâu",
  "Control the drop": "Kiểm soát pha hạ",
  "Control the full descent": "Kiểm soát toàn bộ pha hạ",
  "Control the ribcage": "Kiểm soát lồng ngực",
  "Control the top and bottom": "Kiểm soát vị trí trên cùng và dưới cùng",
  "Couch stretch with overhead reach": "Giãn cơ tựa ghế kèm vươn tay qua đầu",
  "Craning the neck to look forward": "Rướn cổ để nhìn ra trước",
  "Crashing the upper arm into the floor": "Đập mạnh bắp tay trên xuống sàn",
  "Cross-body hammer curl": "Cuốn tạ búa chéo người",
  "Cup one dumbbell vertically at the chest and set a stable squat stance.":
    "Ôm một tạ đơn thẳng đứng trước ngực và vào tư thế squat vững.",
  "Curl one or both dumbbells up.": "Cuốn một hoặc cả hai tạ đơn lên.",
  "Curl the bar up by bending the elbows.":
    "Gập khuỷu tay để cuốn thanh đòn lên.",
  "Curl the dumbbells up without rotating the wrists.":
    "Cuốn tạ đơn lên mà không xoay cổ tay.",
  "Curl the dumbbells while keeping the upper arms still.":
    "Cuốn tạ đơn trong khi giữ bắp tay trên cố định.",
  "Curl the handle toward the shoulders and lower until the elbows straighten under control.":
    "Cuốn tay cầm về phía vai rồi hạ xuống đến khi khuỷu tay duỗi có kiểm soát.",
  "Curl the handle while keeping the upper arm quiet, then lower to a comfortable long-muscle position.":
    "Cuốn tay cầm trong khi giữ bắp tay trên cố định, sau đó hạ đến vị trí cơ giãn dài thoải mái.",
  "Curl the heels down and back, pause, and return until the hamstrings lengthen.":
    "Cuốn gót chân xuống và ra sau, dừng lại rồi trở về đến khi cơ đùi sau được kéo giãn.",
  "Curl the hips off the floor using the abs, not a swing.":
    "Dùng cơ bụng cuộn hông khỏi sàn, không lấy đà.",
  "Curl the hips up off the floor using the abs.":
    "Dùng cơ bụng cuộn hông lên khỏi sàn.",
  "Curl the pelvis toward the ribs": "Cuộn khung chậu về phía xương sườn",
  "Curl the pelvis up as you raise the knees.":
    "Cuộn khung chậu lên khi nâng gối.",
  "Curl the pelvis up, lift with the abs, do not swing.":
    "Cuộn khung chậu lên, nâng bằng cơ bụng, không đung đưa.",
  "Curl the pelvis, not just the hips": "Cuộn khung chậu, không chỉ gập hông",
  "Curl the rope ends toward the shoulders, then extend the elbows slowly.":
    "Cuốn hai đầu dây thừng về phía vai, sau đó từ từ duỗi khuỷu tay.",
  "Curl toward the glutes, pause before the hips lift, and lower slowly.":
    "Cuốn gót về phía cơ mông, dừng trước khi hông nhấc lên và hạ chậm.",
  "Curl with the abs, not a leg swing":
    "Cuộn bằng cơ bụng, không vung chân lấy đà",
  "Curl without lifting the upper arms, then lower slowly before the elbows lock forcefully.":
    "Cuốn tạ mà không nhấc bắp tay trên, sau đó hạ chậm và không khóa khuỷu tay mạnh.",
  "Curling the pelvis up (posterior tilt) trains the exact control that fixes an arched back. Keep ribs down and avoid swinging.":
    "Cuộn khung chậu lên (nghiêng ra sau) rèn đúng khả năng kiểm soát giúp sửa lưng ưỡn. Hạ xương sườn và tránh đung đưa.",
  "Cutting off the bottom range": "Bỏ mất biên độ dưới cùng",
  "Cutting the bottom range short": "Rút ngắn biên độ dưới cùng",
  "Dead bug (arms only)": "Dead Bug (chỉ dùng tay)",
  "Dead bug (legs only)": "Dead Bug (chỉ dùng chân)",
  "Dead bug (opposite arm and leg)": "Dead Bug (tay và chân đối diện)",
  "Dead bug with opposite arm and leg extended":
    "Dead Bug duỗi tay và chân đối diện",
  "Decline push-up with feet elevated on a bench":
    "Chống đẩy dốc xuống với chân kê cao trên ghế",
  "Deficit dumbbell reverse lunge": "Lunge lùi hạ sâu với tạ đơn",
  "Deficit feet-elevated push-up": "Chống đẩy kê chân cao, hạ sâu",
  "Deficit single-leg calf raise": "Nhón bắp chân một chân với biên độ sâu",
  "Deliver planned combinations with stance recovery, defense, and controlled power.":
    "Thực hiện các tổ hợp đòn đã định, trở về thế đứng, phòng thủ và kiểm soát lực đánh.",
  "Descend between the hips as the knees travel forward with the toes.":
    "Hạ người giữa hai hông khi đầu gối đi ra trước cùng hướng mũi chân.",
  "Descend between the hips with the knees tracking the toes.":
    "Hạ người giữa hai hông, giữ đầu gối đi cùng hướng mũi chân.",
  "Descend smoothly, pause before position changes, and drive back without bouncing.":
    "Hạ xuống mượt mà, dừng trước khi đổi hướng rồi đẩy trở lại mà không dùng đà nảy.",
  "Descend to a depth you can control with a neutral spine.":
    "Hạ đến độ sâu bạn có thể kiểm soát với cột sống trung tính.",
  "Descend under control with the knees tracking, then stand without shifting side to side.":
    "Hạ xuống có kiểm soát với đầu gối đúng hướng, sau đó đứng lên mà không lệch sang hai bên.",
  "Descending past controlled pelvic range":
    "Hạ quá biên độ khung chậu có thể kiểm soát",
  "Diamond push-up": "Chống đẩy kim cương",
  "Diamond push-up animation": "Ảnh động chống đẩy kim cương",
  "Diamond push-up with hands forming a triangle":
    "Chống đẩy kim cương với hai tay tạo thành hình tam giác",
  "Dig the heels down, tip the pelvis back, and fully exhale the ribs down.":
    "Ấn gót chân xuống, nghiêng khung chậu ra sau và thở ra hết để hạ xương sườn.",
  "Dip quickly, jump vertically, and absorb the landing before fully resetting.":
    "Nhún nhanh, bật thẳng lên và hấp thụ lực tiếp đất trước khi đặt lại hoàn toàn.",
  "Do not bounce": "Không dùng đà nảy",
  "Do not chase range by arching the lower back or throwing the head back.":
    "Không cố tăng biên độ bằng cách ưỡn lưng dưới hoặc ngửa đầu ra sau.",
  "Do not chase speed": "Không cố chạy theo tốc độ",
  "Do not collapse forward": "Không đổ sụp ra trước",
  "Do not create range by rounding or overextending the spine.":
    "Không tạo thêm biên độ bằng cách cong hoặc ưỡn cột sống quá mức.",
  "Do not descend farther than the pelvis and lower back can remain supported.":
    "Không hạ sâu hơn mức khung chậu và lưng dưới vẫn được nâng đỡ.",
  "Do not flare the lower back": "Không ưỡn bật lưng dưới",
  "Do not force range through the neck, shoulders, or lower-back arch.":
    "Không ép tăng biên độ bằng cổ, vai hoặc độ ưỡn lưng dưới.",
  "Do not force the shoulder farther behind the body than feels comfortable.":
    "Không ép vai ra sau thân người xa hơn mức thoải mái.",
  "Do not gain range by jutting the chin or arching away from the backrest.":
    "Không tăng biên độ bằng cách đưa cằm ra trước hoặc ưỡn người khỏi tựa lưng.",
  "Do not gain range by jutting the chin or excessively arching the lower back.":
    "Không tăng biên độ bằng cách đưa cằm ra trước hoặc ưỡn lưng dưới quá mức.",
  "Do not hyperextend the lower back or let the dumbbell roll toward the abdomen.":
    "Không ưỡn lưng dưới quá mức hoặc để tạ đơn lăn về phía bụng.",
  "Do not jerk the load or poke the chin forward to finish.":
    "Không giật tạ hoặc đưa cằm ra trước để kết thúc.",
  "Do not jerk the weight": "Không giật tạ",
  "Do not lean back": "Không ngả ra sau",
  "Do not lean back or twist to finish the press.":
    "Không ngả ra sau hoặc vặn người để hoàn tất động tác đẩy.",
  "Do not let hips sag or pike": "Không để hông võng xuống hoặc nhô lên",
  "Do not let the cables pull the shoulders into an uncontrolled end range.":
    "Không để cáp kéo vai vào cuối biên độ mất kiểm soát.",
  "Do not let the weight pull the knees into a forceful locked position.":
    "Không để tạ kéo đầu gối vào vị trí khóa mạnh.",
  "Do not make every round maximal; stop if wrist alignment or technique deteriorates.":
    "Không tập mọi vòng ở mức tối đa; dừng lại nếu cổ tay lệch hoặc kỹ thuật sa sút.",
  "Do not overstretch the shoulders": "Không kéo giãn vai quá mức",
  "Do not rotate the torso": "Không xoay thân người",
  "Do not shrug the traps": "Không nhún cơ thang",
  "Do not swing or kip": "Không đung đưa hoặc kip",
  "Do not swing the torso": "Không đung đưa thân người",
  "Do not use a heavy load that turns the movement into a hip hinge.":
    "Không dùng mức tạ nặng đến mức biến động tác thành gập hông.",
  "Do not use lower-back arch or chin reach to create extra range.":
    "Không ưỡn lưng dưới hoặc rướn cằm để tạo thêm biên độ.",
  "Draw the chin straight backward into a small double-chin position, pause, and release.":
    "Thu cằm thẳng ra sau thành tư thế hai cằm nhẹ, dừng lại rồi thả ra.",
  "Drive elbows toward the ribs": "Kéo khuỷu tay về phía xương sườn",
  "Drive the bar up with the glutes, pause at level hips, and lower under control.":
    "Dùng cơ mông đẩy thanh đòn lên, dừng khi hông cân bằng rồi hạ xuống có kiểm soát.",
  "Drive the elbows down and back.": "Kéo khuỷu tay xuống và ra sau.",
  "Drive the elbows down, lift without swinging, and lower to a controlled hang.":
    "Kéo khuỷu tay xuống, nâng người không đung đưa rồi hạ về tư thế treo có kiểm soát.",
  "Drive the elbows out and back toward the upper ribs.":
    "Kéo khuỷu tay mở ra và lùi về phía xương sườn trên.",
  "Drive the elbows toward the ribs to lift the chest.":
    "Kéo khuỷu tay về phía xương sườn để nâng ngực.",
  "Drive the hips up by squeezing the glutes.": "Siết cơ mông để đẩy hông lên.",
  "Drive the knees with the toes": "Đưa đầu gối cùng hướng với mũi chân",
  "Drive the pads outward to a controlled height and lower without dropping the stack.":
    "Đẩy hai đệm ra ngoài đến độ cao có kiểm soát rồi hạ xuống mà không thả rơi chồng tạ.",
  "Drive the standing foot down and squeeze the glute to return upright.":
    "Ấn chân trụ xuống và siết cơ mông để trở lại tư thế thẳng.",
  "Drive the working elbow back and return until the shoulder blade reaches naturally.":
    "Kéo khuỷu tay bên tập ra sau rồi trở về đến khi bả vai vươn tự nhiên.",
  "Drive through that foot to rise without pushing off the floor leg.":
    "Dồn lực qua chân đó để đứng lên mà không đạp bằng chân dưới sàn.",
  "Drive through the elevated leg": "Dồn lực qua chân kê cao",
  "Drive through the feet to a level hip position and lower without losing rib control.":
    "Dồn lực qua hai bàn chân để nâng hông cân bằng rồi hạ xuống mà không mất kiểm soát xương sườn.",
  "Drive through the front foot to return, then repeat on the other side.":
    "Dồn lực qua chân trước để trở về, sau đó lặp lại ở bên kia.",
  "Drive through the whole foot": "Dồn lực qua toàn bộ bàn chân",
  "Drive up through mid-foot to standing.":
    "Dồn lực qua giữa bàn chân để đứng lên.",
  "Drive up through the front foot.": "Dồn lực qua chân trước để đứng lên.",
  "Dropping deeper than the shoulders can control":
    "Hạ sâu hơn mức vai có thể kiểm soát",
  "Dropping down fast": "Hạ xuống quá nhanh",
  "Dropping fast on the way down": "Hạ quá nhanh trong pha đi xuống",
  "Dropping into the shoulders": "Thả sụp vào vai",
  "Dropping quickly back to the floor": "Hạ nhanh trở lại sàn",
  "Dropping quickly from the top": "Thả xuống nhanh từ vị trí trên cùng",
  "Dropping the bar down fast": "Hạ thanh đòn quá nhanh",
  "Dropping the legs fast": "Hạ chân quá nhanh",
  "Dropping the legs quickly": "Hạ chân nhanh",
  "Dropping the legs too fast": "Hạ chân quá nhanh",
  "Dropping the toes quickly": "Hạ mũi chân quá nhanh",
  "Dropping the weights at the finish": "Thả tạ ở cuối động tác",
  "Dropping too deep and straining the shoulders": "Hạ quá sâu gây căng vai",
  "Dropping too deep and stressing the shoulder":
    "Hạ quá sâu gây áp lực lên vai",
  "Dumbbell bench press": "Đẩy ngực nằm với tạ đơn",
  "Dumbbell Bulgarian split squat": "Bulgarian Split Squat với tạ đơn",
  "Dumbbell fly animation": "Ảnh động ép ngực với tạ đơn",
  "Dumbbell fly with slow eccentric": "Ép ngực tạ đơn với pha hạ chậm",
  "Dumbbell kickback": "Duỗi tay sau với tạ đơn (Kickback)",
  "Dumbbell press": "Đẩy tạ đơn",
  "Dumbbell pullover": "Kéo tạ đơn qua đầu (Pullover)",
  "Dumbbell RDL": "RDL với tạ đơn",
  "Dumbbell reverse lunge": "Lunge lùi với tạ đơn",
  "Dumbbell shoulder press with ribs down":
    "Đẩy vai tạ đơn với xương sườn hạ xuống",
  "Dumbbell single-leg hip thrust": "Đẩy hông một chân với tạ đơn",
  "Dumbbell skull crusher": "Skull Crusher với tạ đơn",
  "Dumbbell step-up": "Bước lên bục với tạ đơn",
  "Dumbbell sumo deadlift": "Sumo Deadlift với tạ đơn",
  "Dumbbell/barbell squat": "Squat với tạ đơn/tạ đòn",
  "Earn clean chin-ups before adding load":
    "Thực hiện tốt Chin-up đúng kỹ thuật trước khi thêm tạ",
  "Easy water walking": "Đi bộ nhẹ dưới nước",
  "Eccentric-only sliding curl": "Cuốn đùi sau trượt gót chỉ tập pha hạ",
  "Elbows close to the body": "Giữ khuỷu tay sát cơ thể",
  "Elbows down and back": "Khuỷu tay hướng xuống và ra sau",
  "Elbows fixed at the sides": "Giữ khuỷu tay cố định hai bên thân",
  "Elbows fixed at the sides, curl and squeeze, lower slowly.":
    "Giữ khuỷu tay cố định hai bên thân, cuốn lên và siết cơ, rồi hạ chậm.",
  "Elbows flaring out": "Khuỷu tay mở ra ngoài",
  "Elbows flaring out wide": "Khuỷu tay mở rộng ra ngoài",
  "Elbows flaring straight out": "Khuỷu tay mở thẳng sang hai bên",
  "Elbows flaring too much": "Khuỷu tay mở quá nhiều",
  "Elbows flaring wide": "Khuỷu tay mở rộng",
  "Elbows high, brace hard, and drive through the whole foot.":
    "Giữ khuỷu tay cao, siết thân chắc và dồn lực qua toàn bộ bàn chân.",
  "Elbows near the ribs, curl without leaning back.":
    "Giữ khuỷu tay gần xương sườn, cuốn tạ mà không ngả ra sau.",
  "Elbows slightly tucked, not flared": "Hơi khép khuỷu tay, không mở rộng",
  "Elbows stable and pointing up, only the forearms move.":
    "Giữ khuỷu tay ổn định và hướng lên, chỉ cẳng tay di chuyển.",
  "Elbows track back, not wide": "Đưa khuỷu tay ra sau, không mở rộng",
  "Elbows travel close to the body": "Khuỷu tay di chuyển sát cơ thể",
  "Elbows-out dumbbell row": "Kéo tạ đơn với khuỷu tay mở",
  "Elevate both heels evenly": "Kê cao đều cả hai gót chân",
  "Elevated back foot (couch stretch)": "Kê cao chân sau (giãn cơ tựa ghế)",
  "End the hold when posture shifts or grip becomes unreliable.":
    "Kết thúc lần giữ khi tư thế thay đổi hoặc lực nắm không còn chắc chắn.",
  "Engage the shoulders before pulling": "Kích hoạt vai trước khi kéo",
  "Enter the pool safely and begin with a few easy lengths.":
    "Xuống bể an toàn và bắt đầu bằng vài lượt bơi nhẹ.",
  "Exhale fully until the lower ribs settle, then pause briefly.":
    "Thở ra hết đến khi xương sườn dưới hạ xuống, sau đó dừng ngắn.",
  "Exhale steadily in the water and keep the neck relaxed.":
    "Thở ra đều trong nước và giữ cổ thư giãn.",
  "Exhale steadily underwater": "Thở ra đều dưới nước",
  "Exhale, keep the ribs down, and lift into a glute bridge.":
    "Thở ra, giữ xương sườn hạ xuống và nâng hông lên tư thế Glute Bridge.",
  "Extend gradually toward forty-five minutes when recovery stays good":
    "Tăng dần đến bốn mươi lăm phút khi khả năng phục hồi vẫn tốt",
  "Extend the elbows fully under control, then return without letting them drift forward.":
    "Duỗi khuỷu tay hoàn toàn có kiểm soát, sau đó trở về mà không để khuỷu tay trôi ra trước.",
  "Extend the hips to a controlled level position, pause, and lower smoothly.":
    "Duỗi hông đến vị trí cân bằng có kiểm soát, dừng lại rồi hạ xuống mượt mà.",
  "Extend the legs to form a straight line head to heels.":
    "Duỗi chân để tạo một đường thẳng từ đầu đến gót chân.",
  "Extend to a comfortable top position, squeeze briefly, and lower slowly.":
    "Duỗi đến vị trí trên cùng thoải mái, siết nhẹ rồi hạ chậm.",
  "Extension with slow lowering": "Duỗi tay với pha hạ chậm",
  "Face away from a cable with a rope held behind the head and take a stable staggered stance.":
    "Quay lưng về phía máy cáp, giữ dây thừng sau đầu và đứng chân trước chân sau vững chắc.",
  "Faster / double-under work":
    "Tập nhanh hơn / nhảy hai vòng dây (Double-under)",
  "Feel the hamstrings stretch": "Cảm nhận cơ đùi sau được kéo giãn",
  "Feel the hamstrings stretch with a flat back.":
    "Cảm nhận cơ đùi sau được kéo giãn trong khi giữ lưng phẳng.",
  "Feel the hamstrings, not the lower back":
    "Cảm nhận cơ đùi sau, không phải lưng dưới",
  "Feel the inner chest working throughout.":
    "Cảm nhận phần ngực trong hoạt động suốt động tác.",
  "Feel the lats and chest stretch, ribs staying down.":
    "Cảm nhận cơ xô và ngực được kéo giãn, đồng thời giữ xương sườn hạ xuống.",
  "Feel the lats stretch": "Cảm nhận cơ xô được kéo giãn",
  "Feel the lower back flatten out of any arch.":
    "Cảm nhận lưng dưới phẳng lại, không còn độ ưỡn.",
  "Feet planted, glutes lightly squeezed": "Đặt chân vững, siết nhẹ cơ mông",
  "Feet too far forward or back": "Đặt chân quá xa ra trước hoặc ra sau",
  "Feet up shifts load to the upper chest — keep hips in line.":
    "Kê chân cao chuyển tải lên ngực trên — giữ hông thẳng hàng.",
  "Feet-elevated bridge": "Nâng hông kê chân cao",
  "Feet-elevated close-grip push-up": "Chống đẩy tay hẹp kê chân cao",
  "Feet-elevated diamond push-up": "Chống đẩy kim cương kê chân cao",
  "Feet-elevated inverted row": "Kéo xà thấp kê chân cao",
  "Feet-elevated pike push-up": "Chống đẩy chữ V kê chân cao",
  "Feet-elevated push-up": "Chống đẩy kê chân cao",
  "Feet-on-bench breathing": "Bài thở với chân đặt trên ghế",
  "Feet-stacked reach-through": "Luồn tay với hai chân xếp chồng",
  "Finish beside the ear": "Kết thúc với tay bên cạnh tai",
  "Finish tall with the hips level and the working knee controlled.":
    "Kết thúc ở tư thế thẳng cao, giữ hông cân bằng và kiểm soát gối bên tập.",
  "Finish tall without leaning back":
    "Kết thúc ở tư thế thẳng cao mà không ngả ra sau",
  "Finish with a flat, level hip. Keep the ribs down and glutes squeezed; do not hyperextend the lower back at lockout.":
    "Kết thúc với hông phẳng và cân bằng. Giữ xương sườn hạ xuống và siết cơ mông; không ưỡn lưng dưới quá mức khi khóa động tác.",
  "Finish with easy lengths and exit the pool carefully.":
    "Kết thúc bằng vài lượt bơi nhẹ và rời bể cẩn thận.",
  "Finish with the arm beside the ear and ribs controlled.":
    "Kết thúc với cánh tay bên cạnh tai và xương sườn được kiểm soát.",
  "Finish with the arms and shoulder blades rather than extending the neck.":
    "Kết thúc bằng tay và bả vai thay vì ưỡn cổ.",
  "Finish without arching the back": "Kết thúc mà không ưỡn lưng",
  "Five-minute easy stroll": "Đi bộ nhẹ năm phút",
  "Fixed slight elbow bend": "Giữ khuỷu tay hơi gập cố định",
  "Flaring elbows aggressively": "Mở khuỷu tay quá mạnh",
  "Flaring elbows to 90 degrees": "Mở khuỷu tay đến 90 độ",
  "Flaring elbows too wide": "Mở khuỷu tay quá rộng",
  "Flaring the elbows": "Mở khuỷu tay",
  "Flaring the elbows abruptly": "Mở khuỷu tay đột ngột",
  "Flaring the elbows straight out": "Mở khuỷu tay thẳng sang hai bên",
  "Flaring the ribs and arching the back": "Bật xương sườn và ưỡn lưng",
  "Flaring the ribs during the inhale": "Bật xương sườn lên khi hít vào",
  "Flaring the ribs to finish overhead": "Bật xương sườn để kết thúc trên đầu",
  "Flaring the ribs to finish the press":
    "Bật xương sườn để hoàn tất động tác đẩy",
  "Flaring the ribs upward": "Bật xương sườn lên",
  "Flat back, pull the dumbbell to the hip, no twisting.":
    "Giữ lưng phẳng, kéo tạ đơn về phía hông, không vặn người.",
  "Flat barbell bench press": "Đẩy ngực nằm ghế phẳng với tạ đòn",
  "Flat bench dumbbell fly with a fixed elbow bend":
    "Ép ngực tạ đơn ghế phẳng với khuỷu tay giữ hơi gập",
  "Flat dumbbell bench press": "Đẩy ngực nằm ghế phẳng với tạ đơn",
  "Flat dumbbell fly": "Ép ngực tạ đơn ghế phẳng",
  "Flat dumbbell press": "Đẩy tạ đơn ghế phẳng",
  "Flat easy walk": "Đi bộ nhẹ trên đường bằng phẳng",
};
