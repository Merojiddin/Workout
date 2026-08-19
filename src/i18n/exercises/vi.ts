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
  "Flat walk": "Đi bộ trên mặt phẳng",
  "Flat-floor calf raise": "Nhón bắp chân trên sàn phẳng",
  "Flat-floor seated calf raise": "Nhón bắp chân ngồi trên sàn phẳng",
  "Flatten the lower back": "Ép phẳng lưng dưới",
  "Flatten the lower back by tilting the pelvis with the abs.":
    "Siết cơ bụng để nghiêng khung chậu và ép phẳng lưng dưới.",
  "Flex the trunk to bring the ribs toward the pelvis, then uncurl slowly.":
    "Gập thân để đưa xương sườn về phía khung chậu, rồi từ từ duỗi người ra.",
  "Floor squeeze press": "Đẩy tạ ép sát trên sàn",
  "For arched back, keep ribs down and glutes slightly squeezed. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Nếu lưng bị ưỡn, hãy hạ xương sườn và siết nhẹ cơ mông. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Forcing a painful shoulder range": "Cố ép vai vào biên độ gây đau",
  "Forcing the rear knee into discomfort": "Ép đầu gối sau vào vị trí khó chịu",
  "Forearm plank in a straight line head to heels":
    "Plank cẳng tay, giữ đường thẳng từ đầu đến gót chân",
  "Forearm plank with glutes squeezed and pelvis tucked":
    "Plank cẳng tay, siết cơ mông và thu khung chậu",
  "Forgetting to squeeze the glutes": "Quên siết cơ mông",
  "Form an A-shape with hips as the high point.":
    "Tạo hình chữ A với hông là điểm cao nhất.",
  "Front knee caving inward": "Đầu gối trước đổ vào trong",
  "Front squat": "Squat tạ trước ngực",
  "Full deficit push-up": "Chống đẩy hạ sâu toàn biên độ",
  "Full range every rep": "Mỗi lần đều thực hiện đủ biên độ",
  "Full range without shoulder strain":
    "Thực hiện đủ biên độ mà không làm căng vai",
  "Full range, pause at the top, lower slowly, no bounce.":
    "Thực hiện đủ biên độ, dừng ở đỉnh, hạ chậm và không nảy.",
  "Full rest day": "Ngày nghỉ hoàn toàn",
  "Full sliding hamstring curl": "Cuốn đùi sau trượt gót toàn biên độ",
  "Gently tilt the pelvis to flatten the back into the floor.":
    "Nhẹ nhàng nghiêng khung chậu để ép phẳng lưng xuống sàn.",
  "Gently tuck the pelvis and squeeze the rear-leg glute.":
    "Nhẹ nhàng thu khung chậu và siết cơ mông của chân sau.",
  "Glute bridge march": "Nâng hông kèm bước chân tại chỗ",
  "Glute bridge with hips lifted and ribs down":
    "Nâng hông, giữ hông cao và xương sườn hạ",
  "Glute squeeze (no lift)": "Siết cơ mông (không nâng hông)",
  "Goblet box squat": "Goblet Squat xuống bục",
  "Going too heavy and turning it into a press":
    "Dùng mức tạ quá nặng khiến động tác thành bài đẩy",
  "Going too heavy to hold the squeeze":
    "Dùng mức tạ quá nặng nên không giữ được độ siết",
  "Going too low past the hamstring stretch":
    "Hạ quá thấp, vượt qua điểm căng của cơ đùi sau",
  "Grip slightly wider than shoulder-width.":
    "Nắm thanh rộng hơn vai một chút.",
  "Grip the bar inside the knees, brace, and pull the slack from it.":
    "Nắm thanh ở phía trong hai đầu gối, gồng chắc rồi kéo hết độ rơ của thanh.",
  "Grip the bar underhand at about shoulder-width.":
    "Nắm ngửa thanh, hai tay rộng khoảng bằng vai.",
  "Grip the bar, tuck the pelvis slightly, and brace the abs.":
    "Nắm thanh, hơi thu khung chậu và gồng cơ bụng.",
  "Grip the dip bars and press to a tall lockout.":
    "Nắm xà kép và đẩy người lên cao đến khi tay duỗi thẳng.",
  "Grip the supports and brace into a straight body line.":
    "Nắm điểm tựa và gồng người thành một đường thẳng.",
  "Hack squat machine with the back on the pad":
    "Hack Squat trên máy, lưng tựa vào đệm",
  "Half reps that never reach full hang":
    "Thực hiện nửa biên độ, không bao giờ hạ xuống tư thế treo hoàn toàn",
  "Half reps that never reach overhead":
    "Thực hiện nửa biên độ, không bao giờ đưa tạ lên qua đầu",
  "Half reps that never reach the chest":
    "Thực hiện nửa biên độ, không bao giờ đưa thanh về đến ngực",
  "Half-kneeling hip flexor stretch with a pelvic tuck":
    "Giãn cơ gập hông quỳ một gối kèm thu khung chậu",
  "Half-kneeling hip-flexor stretch": "Giãn cơ gập hông ở tư thế quỳ một gối",
  "Half-kneeling with glute squeeze": "Quỳ một gối và siết cơ mông",
  "Hammer curl": "Cuốn tạ búa (Hammer Curl)",
  "Hammer curl with a neutral thumbs-up grip":
    "Cuốn tạ búa với tay nắm trung tính, ngón cái hướng lên",
  "Hands form a diamond, elbows stay close to the body.":
    "Hai bàn tay tạo hình kim cương, khuỷu tay giữ sát thân.",
  "Hands just inside shoulder width, elbows track close to the ribs.":
    "Hai tay hẹp hơn vai một chút, khuỷu tay đi sát xương sườn.",
  "Hang from the bar with hands slightly wider than shoulders.":
    "Treo người trên xà, hai tay rộng hơn vai một chút.",
  "Hang from the bar with shoulders set down.":
    "Treo người trên xà và hạ vai xuống.",
  "Hang underneath with the body straight.":
    "Treo người bên dưới, giữ thân thẳng.",
  "Hang with shoulders set down and away from the ears.":
    "Treo người với vai hạ xuống và cách xa tai.",
  "Hanging knee raise with a pelvic curl":
    "Treo xà nâng gối kèm cuộn khung chậu",
  "Hanging leg raise": "Treo xà nâng chân thẳng",
  "Head crashing to the floor": "Để đầu đập xuống sàn",
  "Head dropping": "Để đầu rũ xuống",
  "Head dropping or craning up": "Để đầu rũ xuống hoặc ngẩng quá mức",
  "Head poking forward": "Rướn đầu ra trước",
  "Heavier barbell bench press": "Đẩy ngực tạ đòn với mức tạ nặng hơn",
  "Heavier barbell curl": "Cuốn tạ đòn với mức tạ nặng hơn",
  "Heavier barbell RDL": "Deadlift Romania với tạ đòn nặng hơn",
  "Heavier barbell row": "Kéo tạ đòn với mức tạ nặng hơn",
  "Heavier barbell squat": "Squat tạ đòn với mức tạ nặng hơn",
  "Heavier barbell sumo deadlift": "Deadlift Sumo với tạ đòn nặng hơn",
  "Heavier Bulgarian split squat": "Bulgarian Split Squat với mức tạ nặng hơn",
  "Heavier chest-supported row": "Kéo tạ tựa ngực với mức tạ nặng hơn",
  "Heavier dumbbell pullover": "Kéo tạ đơn qua đầu với mức tạ nặng hơn",
  "Heavier dumbbell reverse lunge": "Lunge lùi với tạ đơn nặng hơn",
  "Heavier dumbbell single-leg Romanian deadlift":
    "Deadlift Romania một chân với tạ đơn nặng hơn",
  "Heavier dumbbell step-up": "Bước lên bục với tạ đơn nặng hơn",
  "Heavier elbows-out row": "Kéo tạ khuỷu mở rộng với mức tạ nặng hơn",
  "Heavier farmer carry": "Xách tạ hai bên đi bộ với mức tạ nặng hơn",
  "Heavier front squat": "Squat tạ trước ngực với mức tạ nặng hơn",
  "Heavier hammer curl": "Cuốn tạ búa với mức tạ nặng hơn",
  "Heavier heels-elevated goblet squat":
    "Goblet Squat kê gót cao với mức tạ nặng hơn",
  "Heavier hip thrust": "Đẩy hông với mức tạ nặng hơn",
  "Heavier incline barbell press": "Đẩy tạ đòn ghế dốc lên với mức tạ nặng hơn",
  "Heavier incline dumbbell curl": "Cuốn tạ đơn ghế dốc với mức tạ nặng hơn",
  "Heavier incline dumbbell press":
    "Đẩy tạ đơn ghế dốc lên với mức tạ nặng hơn",
  "Heavier lean-away lateral raise":
    "Nâng tạ sang ngang nghiêng người với mức tạ nặng hơn",
  "Heavier one-arm dumbbell press": "Đẩy tạ đơn một tay với mức tạ nặng hơn",
  "Heavier one-arm dumbbell row": "Kéo tạ đơn một tay với mức tạ nặng hơn",
  "Heavier one-arm floor press":
    "Đẩy tạ đơn một tay trên sàn với mức tạ nặng hơn",
  "Heavier paused bench press": "Đẩy ngực nằm có dừng với mức tạ nặng hơn",
  "Heavier Pendlay row": "Kéo tạ Pendlay với mức tạ nặng hơn",
  "Heavier rear-delt row": "Kéo tạ cho vai sau với mức tạ nặng hơn",
  "Heavier seated dumbbell calf raise":
    "Nhón bắp chân ngồi với tạ đơn nặng hơn",
  "Heavier single-leg hip thrust": "Đẩy hông một chân với mức tạ nặng hơn",
  "Heavier skull crusher": "Duỗi tay sau nằm với mức tạ nặng hơn",
  "Heavier squeeze press": "Đẩy tạ ép sát với mức tạ nặng hơn",
  "Heavier standing press": "Đẩy tạ đứng với mức tạ nặng hơn",
  "Heavier suitcase carry": "Xách tạ một bên đi bộ với mức tạ nặng hơn",
  "Heavier weighted chin-up": "Hít xà tay ngửa có tạ nặng hơn",
  "Heavier weighted pull-up": "Hít xà có tạ nặng hơn",
  "Heel taps": "Chạm gót chân",
  "Heel walkout": "Bước gót chân ra xa",
  "Heels lifting from the floor": "Gót chân nhấc khỏi sàn",
  "Heels lifting off the floor": "Gót chân rời khỏi sàn",
  "High-incline dumbbell press pressing overhead":
    "Biến bài đẩy tạ đơn ghế dốc cao thành đẩy qua đầu",
  "High-incline dumbbell press with the elbows tucked":
    "Đẩy tạ đơn ghế dốc cao với khuỷu tay khép",
  "Higher-intensity rounds": "Các hiệp cường độ cao hơn",
  "Hinge and brace first": "Gập hông và gồng chắc trước",
  "Hinge and brace first, pull the bar to the lower ribs.":
    "Gập hông và gồng chắc trước, kéo thanh về xương sườn dưới.",
  "Hinge at the hips": "Gập người tại hông",
  "Hinge at the hips with a flat back and soft knees.":
    "Gập người tại hông, giữ lưng phẳng và đầu gối hơi chùng.",
  "Hinge at the hips with soft knees and a neutral spine.":
    "Gập người tại hông, đầu gối hơi chùng và cột sống trung tính.",
  "Hinge at the hips, soft knees, feel the hamstrings stretch.":
    "Gập người tại hông, đầu gối hơi chùng và cảm nhận cơ đùi sau căng.",
  "Hinge forward at the hips with a flat back.":
    "Gập thân về trước tại hông, giữ lưng phẳng.",
  "Hinge forward with soft knees and a neutral spine.":
    "Gập thân về trước, đầu gối hơi chùng và cột sống trung tính.",
  "Hinge forward, raise with the rear delts, neck relaxed.":
    "Gập thân về trước, dùng vai sau nâng tạ và thả lỏng cổ.",
  "Hinge slightly forward": "Hơi gập thân về trước",
  "Hinge until the hamstrings limit the range, then stand by driving the hips forward.":
    "Gập hông đến khi độ căng của cơ đùi sau giới hạn biên độ, rồi đẩy hông ra trước để đứng lên.",
  "Hip thrust driven to a level, locked-out finish":
    "Đẩy hông đến vị trí trên cùng ngang bằng và khóa chắc",
  "Hip thrust with the load across the hips and ribs down":
    "Đẩy hông với tạ đặt ngang hông và xương sườn hạ",
  "Hip thrust with the shoulders on a bench and load across the hips":
    "Đẩy hông với vai tựa trên ghế và tạ đặt ngang hông",
  "Hip thrust with upper back on a bench": "Đẩy hông với lưng trên tựa ghế",
  "Hips dropping so it becomes a push-up":
    "Để hông hạ xuống khiến động tác thành chống đẩy",
  "Hips high in an A-shape, lower the head between the hands.":
    "Giữ hông cao tạo hình chữ A, hạ đầu xuống giữa hai bàn tay.",
  "Hips high, weight over the hands":
    "Giữ hông cao, dồn trọng lượng lên hai tay",
  "Hips piking up too high": "Nâng hông nhô lên quá cao",
  "Hips sagging": "Để hông võng xuống",
  "Hips sagging or piking": "Để hông võng xuống hoặc nhô lên",
  "Hold a dumbbell overhead with both hands (or one in each hand).":
    "Giữ một tạ đơn trên đầu bằng cả hai tay (hoặc mỗi tay một tạ).",
  "Hold a fixed torso angle": "Giữ cố định góc thân người",
  "Hold a light band at chest height with soft elbows and relaxed shoulders.":
    "Giữ dây kháng lực nhẹ ngang ngực, khuỷu tay hơi chùng và vai thả lỏng.",
  "Hold a light dumbbell at the outside thigh.":
    "Giữ một tạ đơn nhẹ bên ngoài đùi.",
  "Hold a neutral hip hinge and a long neck; do not round, over-arch, or shrug to complete the row.":
    "Giữ tư thế gập hông trung tính và cổ thẳng dài; không cong lưng, ưỡn quá mức hay nhún vai để hoàn thành lần kéo.",
  "Hold a shallow banana shape with the back still pinned.":
    "Giữ thân hơi cong như quả chuối nhưng lưng vẫn ép sát xuống.",
  "Hold a stable support with one hand and keep both feet planted.":
    "Một tay giữ điểm tựa chắc chắn và giữ cả hai bàn chân trên sàn.",
  "Hold and breathe, keeping the ribs down.":
    "Giữ tư thế và hít thở, đồng thời hạ xương sườn.",
  "Hold briefly, then release to neutral and repeat.":
    "Giữ một lúc, rồi trở về vị trí trung tính và lặp lại.",
  "Hold dumbbells with a neutral (thumbs-up) grip.":
    "Giữ tạ đơn bằng tay nắm trung tính (ngón cái hướng lên).",
  "Hold one dumbbell close to the chest and brace the core.":
    "Giữ một tạ đơn sát ngực và gồng cơ lõi.",
  "Hold one dumbbell over the shoulder and brace the abdomen.":
    "Giữ một tạ đơn trên vai và gồng bụng.",
  "Hold one dumbbell securely with both hands overhead.":
    "Dùng cả hai tay giữ chắc một tạ đơn trên đầu.",
  "Hold steady tension": "Duy trì lực căng ổn định",
  "Hold steady, breathing normally.": "Giữ vững và hít thở bình thường.",
  "Hold steady, then switch sides.": "Giữ vững, rồi đổi bên.",
  "Hold the bar or dumbbells at the thighs, feet hip-width.":
    "Giữ thanh đòn hoặc tạ đơn trước đùi, hai chân rộng bằng hông.",
  "Hold the bridge level while one foot lifts at a time.":
    "Giữ hông ngang bằng trong tư thế nâng hông khi lần lượt nhấc từng chân.",
  "Hold the dumbbells close to the leg": "Giữ tạ đơn sát chân",
  "Hold the handles with the elbows near the ribs.":
    "Nắm tay cầm, giữ khuỷu tay gần xương sườn.",
  "Hold the hinge and row toward the upper ribs with the elbows wide.":
    "Giữ tư thế gập hông và kéo về xương sườn trên với khuỷu tay mở rộng.",
  "Hold the stacked position while breathing normally, then switch sides.":
    "Giữ các khớp xếp thẳng hàng trong khi hít thở bình thường, rồi đổi bên.",
  "Hold the top briefly": "Giữ ở đỉnh một lúc",
  "Hold the torso still": "Giữ thân người bất động",
  "Hold the weight close, stay tall, and let the knees track forward.":
    "Giữ tạ sát người, thân thẳng và để đầu gối đi về trước.",
  "Hold two dumbbells securely at the sides or shoulders and set a balanced stance.":
    "Giữ chắc hai tạ đơn ở hai bên thân hoặc trên vai và đứng vững cân bằng.",
  "Hold, breathing steadily.": "Giữ tư thế, hít thở đều.",
  "Holding the breath underwater": "Nín thở dưới nước",
  "Holding the dumbbell away from the body": "Giữ tạ đơn cách xa cơ thể",
  "Holding the handrails and hunching": "Bám tay vịn và khom người",
  "Hollow body hold": "Giữ tư thế thuyền (Hollow Body Hold)",
  "Hollow body hold with the lower back pinned down":
    "Giữ Hollow Body với lưng dưới ép sát xuống",
  "Hollow body rocks": "Đung đưa ở tư thế Hollow Body",
  "Hunching over a phone": "Khom lưng khi nhìn điện thoại",
  "Hyperextending at lockout": "Duỗi quá mức khi khóa khớp",
  "Ignoring early shin pain": "Phớt lờ cơn đau ống chân mới xuất hiện",
  "Ignoring foot, shin, or joint pain":
    "Phớt lờ cơn đau ở bàn chân, ống chân hoặc khớp",
  "Ignoring the play boundary": "Phớt lờ ranh giới khu vực chơi",
  "Incline barbell press": "Đẩy tạ đòn ghế dốc lên",
  "Incline barbell press to the upper chest":
    "Đẩy tạ đòn ghế dốc lên về phía ngực trên",
  "Incline chest press machine": "Máy đẩy ngực dốc lên",
  "Incline curl with slow lowering": "Cuốn tạ ghế dốc và hạ tạ chậm",
  "Incline diamond push-up": "Chống đẩy kim cương trên mặt phẳng cao",
  "Incline dumbbell curl": "Cuốn tạ đơn ghế dốc",
  "Incline dumbbell fly": "Ép ngực tạ đơn trên ghế dốc",
  "Incline dumbbell press on a 30-degree bench":
    "Đẩy tạ đơn trên ghế dốc 30 độ",
  "Incline dumbbell press with pause": "Đẩy tạ đơn ghế dốc có dừng",
  "Incline inverted row (bar higher)":
    "Kéo xà thấp trên mặt phẳng dốc (thanh xà cao hơn)",
  "Incline plank (hands on bench)": "Plank dốc (hai tay trên ghế)",
  "Incline plank + squeeze": "Plank dốc kèm siết cơ mông",
  "Incline set far too steep (turns into shoulders)":
    "Đặt ghế dốc quá cao khiến bài tập chuyển sang vai",
  "Incline squeeze press": "Đẩy tạ ép sát trên ghế dốc",
  "Incline walk": "Đi bộ dốc",
  "Increase intent before considering a heavier medicine ball":
    "Tăng mức độ chủ động và quyết liệt trước khi cân nhắc dùng bóng tạ nặng hơn",
  "Increase jump intent without adding fatigue":
    "Tăng độ quyết liệt khi bật nhảy mà không làm tăng mệt mỏi",
  "Increase load only while the torso stays level":
    "Chỉ tăng mức tạ khi thân người vẫn giữ ngang bằng",
  "Inhale quietly without losing the rib and pelvic position.":
    "Hít vào nhẹ nhàng mà không làm mất vị trí của xương sườn và khung chậu.",
  "Inverted bodyweight row under a low bar":
    "Kéo người bằng trọng lượng cơ thể dưới xà thấp",
  "Inverted row (bar lower)": "Kéo xà thấp (hạ thanh xà thấp hơn)",
  "Inverted row (underhand)": "Kéo xà thấp (tay nắm ngửa)",
  "Jerking before the brace is set": "Giật tạ trước khi gồng chắc thân người",
  "Jerking the bar back with momentum": "Dùng đà giật thanh về sau",
  "Jerking the body up": "Giật người lên",
  "Jerking the neck forward": "Giật cổ về trước",
  "Jump onto the center of the box, stand under control, and step down carefully.":
    "Bật vào giữa bục, đứng lên có kiểm soát rồi cẩn thận bước xuống.",
  "Jumping too high": "Bật quá cao",
  "Keep a flat, neutral spine and avoid twisting the lower back to move the weight.":
    "Giữ cột sống phẳng, trung tính và không vặn lưng dưới để di chuyển tạ.",
  "Keep a flat, neutral spine through the hinge and avoid snapping into an arch at lockout. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Giữ cột sống phẳng, trung tính trong suốt động tác gập hông và không giật người vào tư thế ưỡn khi khóa khớp. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Keep a guard up": "Giữ hai tay ở thế thủ",
  "Keep a neutral, flat spine while hinged. Do not round or over-arch the lower back to move the weight.":
    "Giữ cột sống trung tính và phẳng khi gập hông. Không cong hoặc ưỡn lưng dưới quá mức để di chuyển tạ.",
  "Keep a slight, fixed bend in the elbows.":
    "Giữ khuỷu tay hơi chùng ở một góc cố định.",
  "Keep a small bend in the elbows.": "Giữ khuỷu tay hơi chùng.",
  "Keep a small fixed bend in the elbows.":
    "Giữ khuỷu tay hơi chùng ở góc cố định.",
  "Keep a soft bend in the standing knee": "Giữ đầu gối trụ hơi chùng",
  "Keep both heels planted": "Giữ cả hai gót chân trên sàn",
  "Keep both hip bones facing the floor": "Giữ hai bên hông hướng xuống sàn",
  "Keep both hip bones level": "Giữ hai bên hông ngang bằng",
  "Keep both hips square": "Giữ hai bên hông vuông thẳng",
  "Keep both hips square and the dumbbells close to the standing leg.":
    "Giữ hai bên hông vuông thẳng và tạ đơn sát chân trụ.",
  "Keep both shoulders grounded": "Giữ cả hai vai trên sàn",
  "Keep both shoulders level": "Giữ hai vai ngang bằng",
  "Keep breathing steady and conversational.":
    "Hít thở đều, vẫn đủ thoải mái để trò chuyện.",
  "Keep chest tall": "Giữ ngực cao",
  "Keep effort moderate rather than adding heavy resistance":
    "Giữ mức gắng sức vừa phải thay vì tăng kháng lực nặng",
  "Keep elbows close": "Giữ khuỷu tay sát người",
  "Keep elbows near the head": "Giữ khuỷu tay gần đầu",
  "Keep elbows stable and high": "Giữ khuỷu tay ổn định và cao",
  "Keep feet and hips planted": "Giữ bàn chân và hông cố định",
  "Keep light pressure through the heels": "Duy trì lực tì nhẹ qua gót chân",
  "Keep pressure even across the forefoot":
    "Phân bố áp lực đều trên phần trước bàn chân",
  "Keep pressure even between sides": "Phân bố áp lực đều giữa hai bên",
  "Keep ribs and hips aligned": "Giữ xương sườn và hông thẳng hàng",
  "Keep ribs down (do not flare)": "Giữ xương sườn hạ (không ưỡn mở)",
  "Keep ribs down and core braced so the movement comes from the back and arms, not a lower-back swing.":
    "Giữ xương sườn hạ và cơ lõi gồng chắc để động tác xuất phát từ lưng và tay, không phải từ cú đánh đà của lưng dưới.",
  "Keep ribs down and glutes squeezed so the body stays in one line instead of sagging at the hips.":
    "Giữ xương sườn hạ và siết cơ mông để cơ thể nằm trên một đường thẳng thay vì võng ở hông.",
  "Keep ribs down and hips lifted in one line; this builds lateral core control that supports the spine.":
    "Giữ xương sườn hạ và hông nâng cao trên một đường thẳng; tư thế này phát triển khả năng kiểm soát cơ lõi bên để hỗ trợ cột sống.",
  "Keep ribs down and the torso still; do not lean back to help the curl.":
    "Giữ xương sườn hạ và thân người bất động; không ngả ra sau để hỗ trợ động tác cuốn tạ.",
  "Keep shoulder blades anchored": "Giữ cố định xương bả vai",
  "Keep shoulders active on the bar": "Giữ vai chủ động khi treo xà",
  "Keep shoulders pulled away from the ears.": "Giữ vai hạ xuống, cách xa tai.",
  "Keep shoulders set back": "Giữ vai kéo về sau",
  "Keep spine neutral": "Giữ cột sống trung tính",
  "Keep steps smooth": "Giữ bước chân nhịp nhàng",
  "Keep that inward pressure and lower to the chest.":
    "Duy trì lực ép hai tạ vào nhau và hạ tạ về ngực.",
  "Keep the ankle aligned and stop if the Achilles tendon or foot feels painful.":
    "Giữ cổ chân thẳng hàng và dừng lại nếu gân Achilles hoặc bàn chân bị đau.",
  "Keep the ankles controlled": "Kiểm soát cổ chân",
  "Keep the ankles controlled, no bouncing.": "Kiểm soát cổ chân, không nảy.",
  "Keep the back flat": "Giữ lưng phẳng",
  "Keep the back supported": "Giữ lưng được nâng đỡ",
  "Keep the bar close and rise with the hips and shoulders together.":
    "Giữ thanh sát người và đứng lên sao cho hông và vai cùng nâng đồng thời.",
  "Keep the bar over mid-foot": "Giữ thanh ngay trên giữa bàn chân",
  "Keep the body rigid": "Giữ cơ thể cứng chắc",
  "Keep the body straight from head to heels.":
    "Giữ cơ thể thẳng từ đầu đến gót chân.",
  "Keep the chest on the bench": "Giữ ngực áp trên ghế",
  "Keep the chest supported and avoid rotating to move a heavier load.":
    "Giữ ngực tựa chắc và không xoay người để di chuyển mức tạ nặng hơn.",
  "Keep the chest supported and row the elbows toward the hips without shrugging.":
    "Giữ ngực tựa chắc và kéo khuỷu tay về phía hông mà không nhún vai.",
  "Keep the core braced and ribs down as you invert so the load stays on the shoulders, not the lower back.":
    "Gồng chắc cơ lõi và hạ xương sườn khi người dần lộn ngược để tải trọng dồn vào vai, không phải lưng dưới.",
  "Keep the dumbbell close to the chest": "Giữ tạ đơn sát ngực",
  "Keep the dumbbells secure on the thighs": "Giữ tạ đơn chắc chắn trên đùi",
  "Keep the effort easy and repeatable":
    "Giữ mức gắng sức nhẹ và có thể lặp lại ổn định",
  "Keep the elbow bend fixed": "Giữ cố định độ gập khuỷu tay",
  "Keep the elbows close to the ribs.": "Giữ khuỷu tay sát xương sườn.",
  "Keep the elbows fixed near the ribs.":
    "Giữ cố định khuỷu tay gần xương sườn.",
  "Keep the elbows high": "Giữ khuỷu tay cao",
  "Keep the elbows pointing up and close to the head.":
    "Giữ khuỷu tay hướng lên và sát đầu.",
  "Keep the elbows tracking back at about 45 degrees.":
    "Giữ khuỷu tay đi về sau ở góc khoảng 45 độ.",
  "Keep the elbows tucked close to the ribs.":
    "Giữ khuỷu tay khép sát xương sườn.",
  "Keep the elbows tucked near the ribs.": "Giữ khuỷu tay khép gần xương sườn.",
  "Keep the elbows wide": "Giữ khuỷu tay mở rộng",
  "Keep the forearm vertical": "Giữ cẳng tay thẳng đứng",
  "Keep the forehead supported or the neck long.":
    "Giữ trán có điểm tựa hoặc giữ cổ thẳng dài.",
  "Keep the free hand relaxed": "Thả lỏng tay không tập",
  "Keep the front foot planted": "Giữ chân trước chắc trên sàn",
  "Keep the head aligned with the torso and let the body stay long in the water. Change stroke or stop if the neck, shoulders, or lower back become uncomfortable.":
    "Giữ đầu thẳng hàng với thân và để cơ thể duỗi dài trong nước. Đổi kiểu bơi hoặc dừng lại nếu cổ, vai hay lưng dưới thấy khó chịu.",
  "Keep the head over the ribs rather than reaching the chin toward the pad.":
    "Giữ đầu thẳng trên xương sườn thay vì rướn cằm về phía đệm.",
  "Keep the head, ribs, and pelvis stacked against the wall. The movement should come from the ankles rather than rocking the body.":
    "Giữ đầu, xương sườn và khung chậu thẳng hàng sát tường. Chuyển động phải xuất phát từ cổ chân thay vì đung đưa cơ thể.",
  "Keep the heels planted and pull the toes toward the shins.":
    "Giữ gót chân trên sàn và kéo mũi chân về phía ống chân.",
  "Keep the hips high and stacked": "Giữ hông cao và xếp thẳng hàng",
  "Keep the hips level": "Giữ hông ngang bằng",
  "Keep the hips lifted and pelvis level as the heels slide.":
    "Giữ hông nâng cao và khung chậu ngang bằng khi trượt gót chân.",
  "Keep the hips lifted while the upper torso rotates under control.":
    "Giữ hông nâng cao trong khi xoay thân trên có kiểm soát.",
  "Keep the hips square": "Giữ hai bên hông vuông thẳng",
  "Keep the knee aligned with the toes":
    "Giữ đầu gối thẳng hàng với các ngón chân",
  "Keep the knees tracking the toes as you push the floor away.":
    "Giữ đầu gối đi theo hướng ngón chân khi đẩy sàn ra xa.",
  "Keep the lats tight": "Siết chắc cơ xô",
  "Keep the lats tight and knees softly bent.":
    "Siết chắc cơ xô và giữ đầu gối hơi chùng.",
  "Keep the lean fixed": "Giữ cố định độ nghiêng người",
  "Keep the lower back flat": "Giữ lưng dưới phẳng",
  "Keep the lower back pinned the whole time.":
    "Giữ lưng dưới ép sát trong suốt động tác.",
  "Keep the lower back pinned throughout.": "Giữ lưng dưới ép sát xuyên suốt.",
  "Keep the machine safeties engaged and avoid bouncing out of the bottom.":
    "Luôn cài chốt an toàn của máy và tránh nảy bật khỏi vị trí thấp nhất.",
  "Keep the neck and jaw relaxed": "Thả lỏng cổ và hàm",
  "Keep the neck long, ribs supported, and shoulders away from the ears while the lower traps guide the shoulder blades.":
    "Giữ cổ thẳng dài, xương sườn được nâng đỡ và vai cách xa tai trong khi cơ thang dưới điều khiển xương bả vai.",
  "Keep the neck long; do not reach the chin toward the handles.":
    "Giữ cổ thẳng dài; không rướn cằm về phía tay cầm.",
  "Keep the neck relaxed and stop before the shoulders roll forward uncontrollably.":
    "Giữ cổ thả lỏng và dừng trước khi vai cuộn về trước ngoài tầm kiểm soát.",
  "Keep the non-punching hand up as a guard.":
    "Giữ tay không đấm ở vị trí phòng thủ.",
  "Keep the pace conversational": "Giữ nhịp độ đủ thoải mái để trò chuyện",
  "Keep the pace easy, posture relaxed, and stride natural.":
    "Giữ nhịp độ nhẹ, tư thế thư giãn và sải bước tự nhiên.",
  "Keep the pelvis level and finish with the glute, not the lower back.":
    "Giữ khung chậu ngang bằng và kết thúc động tác bằng cơ mông, không dùng lưng dưới.",
  "Keep the ribcage controlled and use only a small natural bench arch. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Kiểm soát lồng ngực và chỉ giữ độ ưỡn tự nhiên nhỏ trên ghế. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Keep the ribs and pelvis quiet while the limbs move. Reach lower and longer if lifting the leg makes the back arch.":
    "Giữ xương sườn và khung chậu ổn định khi tay chân chuyển động. Vươn tay thấp hơn và xa hơn nếu nhấc chân làm lưng bị ưỡn.",
  "Keep the ribs controlled and avoid turning the incline press into a large lower-back arch. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Kiểm soát xương sườn và không biến động tác đẩy ghế dốc thành một tư thế ưỡn lưng dưới lớn. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Keep the ribs controlled and do not finish by craning the neck.":
    "Kiểm soát xương sườn và không kết thúc động tác bằng cách rướn cổ.",
  "Keep the ribs controlled and use symptom-free shoulder range.":
    "Kiểm soát xương sườn và chỉ dùng biên độ vai không gây triệu chứng.",
  "Keep the ribs down against the bench and avoid arching the lower back to press the weight.":
    "Giữ xương sườn áp xuống ghế và không ưỡn lưng dưới để đẩy tạ.",
  "Keep the ribs down and abdomen braced so the torso stays quiet instead of swinging or over-arching.":
    "Giữ xương sườn hạ và bụng gồng chắc để thân người ổn định thay vì đung đưa hoặc ưỡn quá mức.",
  "Keep the ribs down and avoid forcing a deep bottom position.":
    "Giữ xương sườn hạ và không cố ép vào vị trí đáy quá sâu.",
  "Keep the ribs down and core braced so you do not swing from the lower back. Neutral spine, no over-arching.":
    "Giữ xương sườn hạ và cơ lõi gồng chắc để không đánh đà từ lưng dưới. Giữ cột sống trung tính, không ưỡn quá mức.",
  "Keep the ribs down and pelvis level so the glutes and core control the march. Reduce the foot lift if the lower back arches or the hips twist.":
    "Giữ xương sườn hạ và khung chậu ngang bằng để cơ mông cùng cơ lõi kiểm soát động tác bước chân. Giảm độ cao nhấc chân nếu lưng dưới bị ưỡn hoặc hông bị xoay.",
  "Keep the ribs down and pelvis level so the hamstrings and glutes move the legs without the lower back taking over.":
    "Giữ xương sườn hạ và khung chậu ngang bằng để cơ đùi sau cùng cơ mông di chuyển chân mà lưng dưới không làm thay.",
  "Keep the ribs down and pelvis level so the single-sided load does not rotate or arch the torso.":
    "Giữ xương sườn hạ và khung chậu ngang bằng để tải trọng một bên không làm thân người xoay hoặc ưỡn.",
  "Keep the ribs down and pelvis level throughout. Stop at a straight hip line and use the glute instead of hyperextending the lower back.":
    "Giữ xương sườn hạ và khung chậu ngang bằng xuyên suốt. Dừng khi hông tạo thành một đường thẳng và dùng cơ mông thay vì duỗi lưng dưới quá mức.",
  "Keep the ribs down and upper arms still while the elbows bend and straighten.":
    "Giữ xương sườn hạ và cánh tay trên bất động trong khi gập rồi duỗi khuỷu tay.",
  "Keep the ribs stacked over the pelvis":
    "Giữ xương sườn thẳng trên khung chậu",
  "Keep the ribs stacked over the pelvis and lean as one unit; do not side-bend or arch to lift the dumbbell.":
    "Giữ xương sườn thẳng trên khung chậu và nghiêng cả người như một khối; không gập ngang hoặc ưỡn người để nâng tạ đơn.",
  "Keep the ribs stacked over the pelvis and rotate through the upper torso while the waist stays lifted. This builds lateral core control without side-bending the lower back.":
    "Giữ xương sườn thẳng trên khung chậu và xoay qua thân trên trong khi eo vẫn nâng cao. Động tác này phát triển khả năng kiểm soát cơ lõi bên mà không gập ngang lưng dưới.",
  "Keep the ribs stacked over the pelvis and the upper back tall. Brace instead of leaning back or rounding to hold the bar.":
    "Giữ xương sườn thẳng trên khung chậu và lưng trên thẳng cao. Gồng người thay vì ngả ra sau hoặc cong lưng để giữ thanh.",
  "Keep the ribs stacked, hips square, and front knee aligned. A slight forward torso angle is fine if the spine stays neutral.":
    "Giữ xương sườn thẳng hàng, hông vuông và đầu gối trước thẳng hướng. Có thể hơi nghiêng thân về trước miễn là cột sống vẫn trung tính.",
  "Keep the rounds technical and stop if balance or foot placement becomes careless.":
    "Giữ các hiệp tập trung vào kỹ thuật và dừng lại nếu khả năng thăng bằng hoặc vị trí bàn chân trở nên cẩu thả.",
  "Keep the shoulder away from the ear": "Giữ vai cách xa tai",
  "Keep the shoulders active": "Giữ vai hoạt động chủ động",
  "Keep the shoulders away from the ears and avoid a forceful end range.":
    "Giữ vai cách xa tai và tránh cố ép đến tận cùng biên độ.",
  "Keep the shoulders level and the weights from hitting the legs.":
    "Giữ hai vai ngang bằng và không để tạ va vào chân.",
  "Keep the shoulders relaxed": "Giữ vai thả lỏng",
  "Keep the shoulders relaxed and the core braced.":
    "Giữ vai thả lỏng và cơ lõi gồng chắc.",
  "Keep the stride comfortable rather than reaching forward.":
    "Giữ sải bước thoải mái thay vì cố vươn chân ra trước.",
  "Keep the torso angle fixed throughout the pull.":
    "Giữ cố định góc thân người trong suốt động tác kéo.",
  "Keep the torso still and ribs down; avoid leaning back to move the weight.":
    "Giữ thân người bất động và xương sườn hạ; tránh ngả ra sau để di chuyển tạ.",
  "Keep the torso still and ribs down; do not lean back or swing from the lower back to lift the weight.":
    "Giữ thân người bất động và xương sườn hạ; không ngả ra sau hoặc đánh đà từ lưng dưới để nâng tạ.",
  "Keep the torso tall and the front knee tracking the toes.":
    "Giữ thân thẳng cao và đầu gối trước đi theo hướng ngón chân.",
  "Keep the torso tall with ribs down and core braced; avoid arching the lower back as you stand.":
    "Giữ thân thẳng cao, xương sườn hạ và cơ lõi gồng chắc; tránh ưỡn lưng dưới khi đứng lên.",
  "Keep the upper arms behind the torso and curl without moving the elbows forward.":
    "Giữ cánh tay trên ở sau thân và cuốn tạ mà không đưa khuỷu tay về trước.",
  "Keep the upper arms close to the head and still.":
    "Giữ cánh tay trên sát đầu và bất động.",
  "Keep the upper arms still.": "Giữ cánh tay trên bất động.",
  "Keep the upper arms vertical and still.":
    "Giữ cánh tay trên thẳng đứng và bất động.",
  "Keep the upper back against the bench and ribs controlled; do not arch or roll the shoulders forward to finish the curl.":
    "Giữ lưng trên áp vào ghế và kiểm soát xương sườn; không ưỡn lưng hoặc cuộn vai về trước để hoàn thành lần cuốn tạ.",
  "Keep the weights close and quiet": "Giữ tạ sát người và không đung đưa",
  "Keep the wrist stacked": "Giữ cổ tay xếp thẳng hàng",
  "Keep the wrists neutral and do not lean back to finish.":
    "Giữ cổ tay trung tính và không ngả ra sau để kết thúc động tác.",
  "Keep this light, stop well before failure, and avoid jutting the head forward.":
    "Tập thật nhẹ, dừng khi vẫn còn cách xa ngưỡng thất bại và tránh rướn đầu về trước.",
  "Keep thumbs pointing up": "Giữ ngón cái hướng lên",
  "Keep upper chest active": "Duy trì hoạt động của ngực trên",
  "Keep wrists over elbows": "Giữ cổ tay thẳng trên khuỷu tay",
  "Keep wrists straight": "Giữ cổ tay thẳng",
  "Keeping the lower back pressed flat is the whole point. If the back arches, reduce the range — this directly builds anti-arch control.":
    "Mục tiêu chính là giữ lưng dưới ép phẳng. Nếu lưng bị ưỡn, hãy giảm biên độ — động tác này trực tiếp phát triển khả năng chống ưỡn.",
  "Kettlebell or dumbbell sumo deadlift": "Deadlift Sumo với tạ ấm hoặc tạ đơn",
  Kickback: "Duỗi tay sau kiểu Kickback",
  "Kickstand Romanian deadlift": "Deadlift Romania chân chống",
  "Kipping to clear the bar": "Dùng đà vung người để vượt qua thanh xà",
  "Knee close-grip push-up": "Chống đẩy tay hẹp trên gối",
  "Knee diamond push-up": "Chống đẩy kim cương trên gối",
  "Knee plank + glute squeeze": "Plank trên gối kèm siết cơ mông",
  "Knee raise on a captain's chair with the back supported":
    "Nâng gối trên ghế nâng chân, lưng được tựa",
  "Knee side-plank reach-through": "Plank nghiêng trên gối kèm luồn tay",
  "Knee tuck": "Co gối về ngực",
  "Kneel facing a high cable and hold the rope beside the head with a stable base.":
    "Quỳ đối diện cáp cao, giữ dây thừng cạnh đầu và tạo điểm tựa vững chắc.",
  "Kneel in a half-kneeling position (one knee down).":
    "Vào tư thế quỳ một gối (một gối chạm sàn).",
  "Kneel in front of a bench or wall with the elbows or hands supported comfortably.":
    "Quỳ trước ghế hoặc tường, đặt khuỷu tay hoặc bàn tay lên điểm tựa thoải mái.",
  "Kneeling barbell rollout": "Lăn tạ đòn quỳ gối",
  "Kneeling cable crunch with the rope by the head":
    "Gập bụng quỳ với cáp, giữ dây thừng cạnh đầu",
  "Kneeling crunch curling the ribs toward the hips":
    "Gập bụng quỳ, cuộn xương sườn về phía hông",
  "Knees caving inward": "Đầu gối đổ vào trong",
  "Knees track over the toes": "Đầu gối đi theo hướng ngón chân",
  "Landing flat-footed and hard": "Tiếp đất bằng cả bàn chân quá mạnh",
  "Lat prayer/stretch": "Kéo giãn cơ xô kiểu cầu nguyện",
  "Lateral raise": "Nâng tay sang ngang",
  "Lateral raise driving the elbows out to the sides":
    "Nâng tay sang ngang bằng cách dẫn khuỷu tay ra hai bên",
  "Lateral raise to shoulder height with the elbows soft":
    "Nâng tay sang ngang đến ngang vai, khuỷu tay hơi chùng",
  "Lateral raise with pause at top": "Nâng tay sang ngang và dừng ở đỉnh",
  "Lead with a pelvic curl and keep the ribs down. If the lower back arches or the body swings, bend the knees or shorten the range.":
    "Bắt đầu bằng động tác cuộn khung chậu và giữ xương sườn hạ. Nếu lưng dưới bị ưỡn hoặc cơ thể đung đưa, hãy gập gối hoặc rút ngắn biên độ.",
  "Lead with the elbow": "Dẫn động tác bằng khuỷu tay",
  "Lead with the elbow and raise the arm near shoulder height.":
    "Dẫn bằng khuỷu tay và nâng cánh tay lên gần ngang vai.",
  "Lead with the elbows": "Dẫn động tác bằng hai khuỷu tay",
  "Lead with the elbows to raise the arms out to the sides.":
    "Dẫn bằng khuỷu tay để nâng cánh tay ra hai bên.",
  "Lead with the elbows, stop at shoulder height, no shrug.":
    "Dẫn bằng khuỷu tay, dừng ở ngang vai và không nhún vai.",
  "Leading with the hand": "Dẫn động tác bằng bàn tay",
  "Leading with the head": "Dẫn động tác bằng đầu",
  "Lean away as one rigid line and lead the raise with the elbow.":
    "Nghiêng người ra xa như một đường thẳng cứng chắc và dẫn động tác nâng bằng khuỷu tay.",
  "Lean away slightly while keeping the body in one straight line.":
    "Hơi nghiêng người ra xa nhưng vẫn giữ cơ thể trên một đường thẳng.",
  "Lean forward for chest emphasis":
    "Hơi nghiêng người về trước để tập trung vào ngực",
  "Lean slightly forward for chest, keep shoulders down.":
    "Hơi nghiêng người về trước để tập trung vào ngực, giữ vai hạ.",
  "Lean the torso slightly forward for more chest.":
    "Hơi nghiêng thân về trước để tác động vào ngực nhiều hơn.",
  "Lean the upper back against a wall and walk the feet slightly forward.":
    "Tựa lưng trên vào tường và bước hai chân nhẹ về trước.",
  "Lean-away lateral raise": "Nâng tạ sang ngang nghiêng người",
  "Lean-away raise with pause": "Nâng tạ nghiêng người có dừng",
  "Leaning away from the dumbbell": "Nghiêng người ra xa tạ đơn",
  "Leaning away to compensate": "Nghiêng người ra xa để bù trừ",
  "Leaning back on the belt": "Ngả người ra sau trên đai",
  "Leaning back to cheat the rep": "Ngả ra sau để gian lận lần tập",
  "Leaning cable/band raise": "Nâng cáp hoặc dây kháng lực khi nghiêng người",
  "Leaning the torso forward": "Nghiêng thân người về trước",
  "Leaning too far forward": "Nghiêng người quá xa về trước",
  "Leaning toward the dumbbell": "Nghiêng người về phía tạ đơn",
  "Learn the throw with a light ball": "Học động tác ném với bóng nhẹ",
  "Leg curl bending the knees against resistance":
    "Cuốn đùi sau bằng cách gập gối chống lại kháng lực",
  "Leg press with the feet mid-platform":
    "Đạp đùi với bàn chân đặt ở giữa bàn đạp",
  "Leg raise with hip lift": "Nâng chân kèm nâng hông",
  "Leg-only bird dog": "Bird Dog chỉ duỗi chân",
  "Legs too low for your control": "Hạ chân quá thấp so với khả năng kiểm soát",
  "Let light dumbbells hang below the shoulders.":
    "Để tạ đơn nhẹ buông thẳng dưới vai.",
  "Let light dumbbells hang under the shoulders.":
    "Để tạ đơn nhẹ buông xuống dưới vai.",
  "Let the arms hang behind the torso with palms facing forward.":
    "Để hai tay buông sau thân, lòng bàn tay hướng về trước.",
  "Let the arms hang naturally": "Để hai tay buông tự nhiên",
  "Let the arms swing naturally.": "Để hai tay đánh tự nhiên.",
  "Let the bar hang under the shoulders.": "Để thanh buông thẳng dưới vai.",
  "Let the bench support a neutral torso and keep the neck long; do not lift or over-arch the chest to finish a rep.":
    "Để ghế nâng đỡ thân người ở vị trí trung tính và giữ cổ thẳng dài; không nâng hoặc ưỡn ngực quá mức để hoàn thành lần tập.",
  "Let the dumbbell hang under the shoulder.":
    "Để tạ đơn buông thẳng dưới vai.",
  "Let the dumbbells hang with the neck relaxed.":
    "Để tạ đơn buông xuống và giữ cổ thả lỏng.",
  "Let the elbows travel wide": "Để khuỷu tay di chuyển rộng ra ngoài",
  "Let the shoulders stay loose": "Giữ vai thả lỏng",
  "Letting one hip drop": "Để một bên hông hạ xuống",
  "Letting the dumbbells drift apart": "Để hai tạ đơn tách ra",
  "Letting the dumbbells slide toward the knees":
    "Để tạ đơn trượt về phía đầu gối",
  "Letting the dumbbells swing into the legs": "Để tạ đơn đung đưa va vào chân",
  "Letting the elbows drift back": "Để khuỷu tay trôi về sau",
  "Letting the elbows drop": "Để khuỷu tay hạ xuống",
  "Letting the front knee cave inward": "Để đầu gối trước đổ vào trong",
  "Letting the hips shoot up first": "Để hông bật lên trước",
  "Letting the knees collapse inward": "Để đầu gối sụp vào trong",
  "Letting the load swing": "Để mức tạ đung đưa",
  "Letting the lower back sag": "Để lưng dưới võng xuống",
  "Letting the ribs flare": "Để xương sườn ưỡn mở",
  "Letting the weight swing": "Để tạ đung đưa",
  "Letting the working knee cave inward": "Để đầu gối bên tập đổ vào trong",
  "Letting the wrist fold backward": "Để cổ tay gập ra sau",
  "Letting the wrists bend backward": "Để cổ tay cong ra sau",
  "Lie face down on a low incline bench with light dumbbells hanging freely.":
    "Nằm sấp trên ghế dốc thấp, để tạ đơn nhẹ buông tự do.",
  "Lie face down on an incline bench or mat.":
    "Nằm sấp trên ghế dốc hoặc thảm.",
  "Lie face down with the knees aligned to the pivot and the roller above the heels.":
    "Nằm sấp, đặt đầu gối thẳng với trục xoay và đệm lăn ở phía trên gót chân.",
  "Lie on a bench holding dumbbells or a barbell over the chest.":
    "Nằm trên ghế, giữ tạ đơn hoặc tạ đòn phía trên ngực.",
  "Lie on a bench holding one dumbbell over the chest.":
    "Nằm trên ghế, giữ một tạ đơn phía trên ngực.",
  "Lie on a flat bench holding light dumbbells above the chest.":
    "Nằm trên ghế phẳng, giữ tạ đơn nhẹ phía trên ngực.",
  "Lie on a flat bench holding two dumbbells together over the chest.":
    "Nằm trên ghế phẳng, giữ hai tạ đơn ép sát nhau phía trên ngực.",
  "Lie on a flat bench with the feet planted and dumbbells stable beside the chest.":
    "Nằm trên ghế phẳng, đặt bàn chân chắc trên sàn và giữ tạ đơn ổn định cạnh ngực.",
  "Lie on your back with the arms overhead.": "Nằm ngửa, hai tay duỗi qua đầu.",
  "Lie on your back with the arms up and knees over the hips.":
    "Nằm ngửa, hai tay hướng lên và đầu gối ở trên hông.",
  "Lie on your back with the heels on sliders or towels over a smooth floor.":
    "Nằm ngửa, đặt gót chân trên đĩa trượt hoặc khăn trên sàn trơn.",
  "Lie on your back with the hips and knees bent to 90 degrees.":
    "Nằm ngửa, gập hông và đầu gối 90 độ.",
  "Lie on your back with the knees bent and feet planted.":
    "Nằm ngửa, gập gối và đặt bàn chân chắc trên sàn.",
  "Lie on your back with the knees bent over the hips.":
    "Nằm ngửa, gập đầu gối phía trên hông.",
  "Lie on your back with the legs straight.": "Nằm ngửa, hai chân duỗi thẳng.",
  "Lie on your side with the forearm under the shoulder.":
    "Nằm nghiêng, đặt cẳng tay ngay dưới vai.",
  "Lie securely on the chest pad and take the selected T-bar handles.":
    "Nằm chắc chắn trên đệm tựa ngực và nắm tay cầm T-bar đã chọn.",
  "Lie square on the floor with the knees bent and feet planted.":
    "Nằm ngay ngắn trên sàn, gập gối và đặt bàn chân chắc xuống.",
  "Lift one dumbbell safely and hold it beside one thigh.":
    "Nâng một tạ đơn lên an toàn và giữ cạnh một bên đùi.",
  "Lift the arms a small distance by moving the shoulder blades.":
    "Di chuyển xương bả vai để nâng hai tay lên một đoạn ngắn.",
  "Lift the elbows, brace the core, and keep the whole foot planted.":
    "Nâng khuỷu tay, gồng cơ lõi và giữ toàn bộ bàn chân trên sàn.",
  "Lift the hips before sliding": "Nâng hông trước khi trượt chân",
  "Lift the hips into a straight side-plank position.":
    "Nâng hông vào tư thế Plank nghiêng thẳng người.",
  "Lift the hips so the body is one straight line.":
    "Nâng hông để cơ thể tạo thành một đường thẳng.",
  "Lift the hips, do not sag": "Nâng hông, không để võng xuống",
  "Lift the knees toward the chest without swinging.":
    "Nâng đầu gối về phía ngực mà không đung đưa.",
  "Lift the other foot and keep the pelvis level before starting.":
    "Nhấc chân còn lại và giữ khung chậu ngang bằng trước khi bắt đầu.",
  "Lift the shoulders and legs off the floor.": "Nâng vai và chân khỏi sàn.",
  "Lift the toes and forefeet toward the shins as high as possible.":
    "Nâng các ngón và phần trước bàn chân về phía ống chân cao hết mức có thể.",
  "Lift the toes toward the shins": "Nâng mũi chân về phía ống chân",
  "Lift with the abs": "Dùng cơ bụng để nâng",
  "Lifting hips off the bench": "Nhấc hông khỏi ghế",
  "Lifting only from the hip flexors": "Chỉ nâng bằng cơ gập hông",
  "Lifting the chest to create momentum": "Nâng ngực để tạo đà",
  "Lifting the head to gain range": "Nâng đầu để tăng biên độ",
  "Lifting the hips from the bench": "Nhấc hông lên khỏi ghế",
  "Lifting the hips into a bridge": "Nâng hông vào tư thế cây cầu",
  "Lifting the hips to start the press": "Nâng hông để bắt đầu đẩy",
  "Lifting the knee too far toward the chest": "Nâng đầu gối quá sát ngực",
  "Lifting the shoulders from the bench": "Nhấc vai khỏi ghế",
  "Light barbell curl": "Cuốn tạ đòn nhẹ",
  "Light dumbbell curl": "Cuốn tạ đơn nhẹ",
  "Light dumbbell RDL": "Deadlift Romania với tạ đơn nhẹ",
  "Light dumbbell row": "Kéo tạ đơn nhẹ",
  "Light dumbbell Y-raise": "Nâng chữ Y với tạ đơn nhẹ",
  "Light farmer carry": "Xách tạ nhẹ hai bên đi bộ",
  "Light farmer hold": "Giữ tạ nhẹ hai bên tại chỗ",
  "Light glute squeeze": "Siết nhẹ cơ mông",
  "Light goblet squat": "Goblet Squat với tạ nhẹ",
  "Light hammer curl": "Cuốn tạ búa nhẹ",
  "Light lateral raise": "Nâng tạ nhẹ sang ngang",
  "Light on the feet, rotate through the core, keep a guard.":
    "Di chuyển nhẹ chân, xoay qua cơ lõi và giữ thế thủ.",
  "Light overhead dumbbell extension": "Duỗi tay sau qua đầu với tạ đơn nhẹ",
  "Light overhead extension": "Duỗi tay sau qua đầu với mức tạ nhẹ",
  "Light suitcase carry": "Xách tạ nhẹ một bên đi bộ",
  "Light weighted chin-up": "Hít xà tay ngửa với tạ nhẹ",
  "Light, controlled load": "Mức tạ nhẹ, được kiểm soát",
  "Light, controlled reps": "Các lần tập nhẹ và có kiểm soát",
  "Lighter dumbbell": "Tạ đơn nhẹ hơn",
  "Lighter dumbbells": "Các tạ đơn nhẹ hơn",
  "Link controlled punches, defense, pivots, and exits without chasing maximal speed.":
    "Kết hợp các cú đấm, phòng thủ, xoay trụ và thoát góc có kiểm soát mà không cố đạt tốc độ tối đa.",
  "Load the hips, rotate, and throw into the wall before collecting the rebound and resetting.":
    "Dồn lực vào hông, xoay người và ném bóng vào tường, rồi bắt bóng bật lại và vào lại tư thế ban đầu.",
  "Loaded standing calf raise through a full ankle range":
    "Nhón bắp chân đứng có tải qua toàn bộ biên độ cổ chân",
  "Loading more weight than the rack position allows":
    "Dùng mức tạ vượt quá khả năng giữ ở vị trí rack",
  "Long-lever plank + glute squeeze": "Plank đòn bẩy dài kèm siết cơ mông",
  "Long-pause bridge march":
    "Nâng hông kèm bước chân tại chỗ với thời gian dừng lâu",
  "Longer easy swimming": "Bơi nhẹ lâu hơn",
  "Longer easy walk when well recovered":
    "Đi bộ nhẹ lâu hơn khi cơ thể đã hồi phục tốt",
  "Longer farmer carry": "Xách tạ hai bên đi bộ lâu hơn",
  "Longer incline walk": "Đi bộ dốc lâu hơn",
  "Longer paused bench press": "Đẩy ngực nằm với thời gian dừng lâu hơn",
  "Longer suitcase carry": "Xách tạ một bên đi bộ lâu hơn",
  "Longer-range rollout with a pause": "Lăn tạ xa hơn và có dừng",
  "Losing balance and rushing reps":
    "Mất thăng bằng và vội vàng thực hiện các lần tập",
  "Losing foot pressure at the bottom":
    "Mất áp lực bàn chân ở vị trí thấp nhất",
  "Losing the brace and arching": "Mất độ gồng và ưỡn lưng",
  "Losing the brace at the bottom": "Mất độ gồng ở vị trí thấp nhất",
  "Losing the flat-back position": "Mất tư thế lưng phẳng",
  "Losing the pelvic tuck between breaths":
    "Mất độ thu khung chậu giữa các nhịp thở",
  "Lower back sagging": "Lưng dưới võng xuống",
  "Lower back to the shoulders without flaring the ribs.":
    "Hạ tạ trở lại vai mà không ưỡn mở xương sườn.",
  "Lower both knees while keeping the hips square and torso controlled.":
    "Hạ cả hai đầu gối trong khi giữ hông vuông thẳng và thân người được kiểm soát.",
  "Lower evenly with elbows slightly tucked.":
    "Hạ đều hai bên với khuỷu tay hơi khép.",
  "Lower incline": "Độ dốc thấp hơn",
  "Lower intensity": "Cường độ thấp hơn",
  "Lower more slowly than you lift": "Hạ chậm hơn tốc độ nâng lên",
  "Lower slowly through the stretched bottom position.":
    "Hạ chậm qua vị trí thấp nhất, nơi cơ đang được kéo căng.",
  "Lower slowly to a comfortable full stretch.":
    "Hạ chậm đến độ căng hết mức nhưng vẫn thoải mái.",
  "Lower slowly to a full stretch.": "Hạ chậm đến khi duỗi căng hết mức.",
  "Lower slowly to a still hang before the next repetition.":
    "Hạ chậm về tư thế treo bất động trước lần tiếp theo.",
  "Lower slowly to full length": "Hạ chậm đến khi duỗi dài hoàn toàn",
  "Lower slowly to the floor before the next repetition.":
    "Từ từ hạ xuống sàn trước lần tiếp theo.",
  "Lower slowly until the rear shoulders lengthen.":
    "Hạ chậm đến khi cảm nhận vai sau được kéo giãn.",
  "Lower slowly without changing the torso angle.":
    "Hạ chậm mà không thay đổi góc thân người.",
  "Lower slowly without swinging.": "Hạ chậm mà không đung đưa.",
  "Lower straight down under control.": "Hạ thẳng xuống có kiểm soát.",
  "Lower the bar to mid-chest under control.":
    "Hạ thanh về giữa ngực có kiểm soát.",
  "Lower the bar toward the upper chest under control.":
    "Hạ thanh về phía ngực trên có kiểm soát.",
  "Lower the bar under control to the lower chest.":
    "Hạ thanh về ngực dưới có kiểm soát.",
  "Lower the chest between the hands through a comfortable range.":
    "Hạ ngực xuống giữa hai bàn tay trong biên độ thoải mái.",
  "Lower the chest toward the floor under control.":
    "Hạ ngực về phía sàn có kiểm soát.",
  "Lower the chest toward the hands under control.":
    "Hạ ngực về phía hai bàn tay có kiểm soát.",
  "Lower the chest under control.": "Hạ ngực có kiểm soát.",
  "Lower the chest while the elbows track close to the ribs.":
    "Hạ ngực trong khi khuỷu tay đi sát xương sườn.",
  "Lower the crown of the head": "Hạ đỉnh đầu xuống",
  "Lower the dumbbell back behind the head.": "Hạ tạ đơn trở lại phía sau đầu.",
  "Lower the dumbbell behind the head by bending the elbows.":
    "Gập khuỷu tay để hạ tạ đơn ra sau đầu.",
  "Lower the forefeet slowly": "Từ từ hạ phần trước bàn chân",
  "Lower the forefeet slowly while the heels remain planted.":
    "Từ từ hạ phần trước bàn chân trong khi gót vẫn trên sàn.",
  "Lower the head toward the floor between the hands.":
    "Hạ đầu về phía sàn giữa hai bàn tay.",
  "Lower the heels slowly into a comfortable calf stretch.":
    "Từ từ hạ gót xuống đến khi bắp chân được kéo giãn thoải mái.",
  "Lower the hips slowly under control.": "Từ từ hạ hông có kiểm soát.",
  "Lower the hips when you can no longer keep them level.":
    "Hạ hông xuống khi không còn giữ được hai bên ngang bằng.",
  "Lower the legs only as far as the back stays flat":
    "Chỉ hạ chân đến mức lưng vẫn phẳng",
  "Lower the legs slowly only as far as the back stays flat.":
    "Từ từ hạ chân, chỉ đến mức lưng vẫn phẳng.",
  "Lower the platform smoothly and press through the whole foot without hard knee lockout.":
    "Hạ bàn đạp êm và đẩy bằng toàn bộ bàn chân mà không khóa cứng đầu gối.",
  "Lower the weight behind the head by bending the elbows.":
    "Gập khuỷu tay để hạ tạ ra sau đầu.",
  "Lower to a controlled depth and drive the platform away without locking the knees forcefully.":
    "Hạ đến độ sâu có thể kiểm soát rồi đẩy bàn đạp ra xa mà không khóa gối mạnh.",
  "Lower to the shoulder under control before changing sides.":
    "Hạ tạ về vai có kiểm soát trước khi đổi bên.",
  "Lower toward the upper chest through comfortable range and press without lifting the hips.":
    "Hạ về phía ngực trên trong biên độ thoải mái và đẩy lên mà không nhấc hông.",
  "Lower under control to a full arm extension.":
    "Hạ có kiểm soát đến khi cánh tay duỗi hoàn toàn.",
  "Lower under control until the upper arms are near parallel.":
    "Hạ có kiểm soát đến khi cánh tay trên gần song song với sàn.",
  "Lower under control while keeping both sides of the pelvis even.":
    "Hạ có kiểm soát trong khi giữ hai bên khung chậu ngang nhau.",
  "Lower under control without arching the back.":
    "Hạ có kiểm soát mà không ưỡn lưng.",
  "Lower under control without rounding the back.":
    "Hạ có kiểm soát mà không cong lưng.",
  "Lower under control without twisting the torso.":
    "Hạ có kiểm soát mà không xoay thân người.",
  "Lower under full control to a complete hang.":
    "Hạ hoàn toàn có kiểm soát về tư thế treo hết biên độ.",
  "Lower until the shoulder blades spread under control.":
    "Hạ đến khi xương bả vai tách ra có kiểm soát.",
  "Lower until the upper arm touches the floor softly.":
    "Hạ đến khi cánh tay trên chạm nhẹ xuống sàn.",
  "Lower vertically with the front knee tracking and rise without pushing off the rear leg.":
    "Hạ thẳng đứng, giữ đầu gối trước đi đúng hướng rồi đứng lên mà không đẩy bằng chân sau.",
  "Lowering beyond a comfortable shoulder position":
    "Hạ vượt quá vị trí thoải mái của vai",
  "Lowering past your control": "Hạ vượt quá khả năng kiểm soát",
  "Lowering too far for the shoulders": "Hạ quá sâu so với khả năng của vai",
  "Lying leg curl machine with the pad above the heels":
    "Máy cuốn đùi sau nằm sấp với đệm ở trên gót chân",
  "Lying leg raise with the lower back pressed flat":
    "Nằm nâng chân với lưng dưới ép phẳng",
  "Lying reverse crunch": "Gập bụng ngược ở tư thế nằm",
  "Machine leg curl bending the knees against the pad":
    "Máy cuốn đùi sau, gập gối chống lại đệm",
  "Machine squat with the back supported on a pad":
    "Máy Squat với lưng tựa trên đệm",
  "Maintain a rigid neutral spine and reset the brace from the floor before every repetition. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Duy trì cột sống trung tính cứng chắc và siết lại thân người từ sàn trước mỗi lần tập. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Maintain a strong full-hand grip":
    "Duy trì tay nắm chắc bằng toàn bộ bàn tay",
  "Maintain pelvic control at depth":
    "Duy trì kiểm soát khung chậu ở vị trí sâu",
  "Maintain the pelvic position as you inhale":
    "Duy trì vị trí khung chậu khi hít vào",
  Marching: "Bước chân tại chỗ",
  "Marching faster than the pelvis can stay steady":
    "Bước chân nhanh hơn khả năng giữ khung chậu ổn định",
  "Moderate rounds": "Các hiệp cường độ vừa",
  "Modest incline, elbows slightly tucked, press up and in.":
    "Ghế dốc vừa phải, khuỷu tay hơi khép, đẩy tạ lên trên và vào trong.",
  "More rest between lengths": "Nghỉ lâu hơn giữa các lượt bơi",
  "Move from a braced, ribs-down torso and rotate through the core. Avoid over-reaching, which strains the shoulder and lower back.":
    "Bắt đầu từ thân người gồng chắc, xương sườn hạ và xoay qua cơ lõi. Tránh vươn quá xa vì sẽ gây căng vai và lưng dưới.",
  "Move slowly and controlled": "Di chuyển chậm và có kiểm soát",
  "Move slowly in both directions": "Di chuyển chậm theo cả hai hướng",
  "Move slowly under control": "Di chuyển chậm có kiểm soát",
  "Move the chest and hips together": "Di chuyển ngực và hông cùng nhau",
  "Move the torso and free leg together around the hip. Keep the spine long and the pelvis level rather than twisting or reaching lower.":
    "Di chuyển thân người và chân tự do cùng nhau quanh khớp hông. Giữ cột sống dài và khung chậu ngang bằng thay vì xoay người hoặc cố hạ thấp hơn.",
  "Move the torso upright only until the front hip and thigh stretch.":
    "Chỉ đưa thân người thẳng lên đến khi cảm nhận hông và đùi trước được kéo giãn.",
  "Move through the shoulders": "Di chuyển từ khớp vai",
  "Move through the shoulders, feel the lats stretch, ribs down.":
    "Di chuyển từ khớp vai, cảm nhận cơ xô được kéo giãn và giữ xương sườn hạ.",
  "Moving the elbows forward during the curl":
    "Đưa khuỷu tay về trước khi cuốn tạ",
  "Moving the upper arms with each rep":
    "Di chuyển cánh tay trên trong mỗi lần tập",
  "Moving too fast": "Di chuyển quá nhanh",
  "Moving too quickly on the slide out": "Trượt chân ra quá nhanh",
  "Moving too quickly to control the pause":
    "Di chuyển quá nhanh nên không kiểm soát được điểm dừng",
  "Neck cranking back": "Ngửa cổ ra sau quá mức",
  "Neck reaching forward": "Rướn cổ về trước",
  "Negative-only dip": "Xà kép chỉ thực hiện pha hạ",
  "Neutral (thumbs-up) grip, elbows close, no swing.":
    "Tay nắm trung tính (ngón cái hướng lên), khuỷu tay sát người, không đung đưa.",
  "Neutral grip throughout": "Giữ tay nắm trung tính xuyên suốt",
  "Neutral neck": "Giữ cổ trung tính",
  "Neutral spine, no sag": "Giữ cột sống trung tính, không võng",
  "Neutral spine, small natural arch only":
    "Giữ cột sống trung tính, chỉ ưỡn tự nhiên nhẹ",
  "Never chase box height when tired, and do not jump down from the box.":
    "Không bao giờ cố tăng độ cao bục khi đã mệt và không nhảy từ bục xuống.",
  "No pause or squeeze at the top": "Không dừng hoặc siết ở đỉnh",
  "Not squeezing the glute": "Không siết cơ mông",
  "Not squeezing the glutes at the top": "Không siết cơ mông ở đỉnh",
  "Notice the natural gap under the lower back.":
    "Nhận biết khoảng hở tự nhiên dưới lưng dưới.",
  "On a secured leg press, place the balls of the feet on the lower platform with the knees softly bent.":
    "Trên máy đạp đùi đã khóa an toàn, đặt phần đầu bàn chân lên mép dưới của bàn đạp và giữ đầu gối hơi chùng.",
  "One arm at a time": "Mỗi lần một tay",
  "One leg extended": "Duỗi một chân",
  "One-arm dumbbell floor press": "Đẩy tạ đơn một tay trên sàn",
  "One-arm dumbbell row supported on a bench":
    "Kéo tạ đơn một tay có ghế hỗ trợ",
  "One-arm floor press with pause": "Đẩy tạ một tay trên sàn có dừng",
  "One-arm row with pause": "Kéo tạ một tay có dừng",
  "Only lifting with the hip flexors": "Chỉ nâng bằng cơ gập hông",
  "Only lower as far as you can hold the back flat":
    "Chỉ hạ đến mức bạn vẫn giữ được lưng phẳng",
  "Only moving the knees, not the pelvis":
    "Chỉ di chuyển đầu gối, không cuộn khung chậu",
  "Only placing the toes on the step": "Chỉ đặt các ngón chân lên bục",
  "Only reach as far as the back stays flat": "Chỉ vươn đến mức lưng vẫn phẳng",
  "Only using the arms (no rotation)": "Chỉ dùng tay, không xoay người",
  "Open the arms in a wide arc, lowering slowly.":
    "Mở hai tay theo một vòng cung rộng và từ từ hạ xuống.",
  "Opening the free-leg hip outward": "Xoay hông của chân tự do ra ngoài",
  "Opening the pelvis to the side": "Mở khung chậu sang bên",
  "Optional only when completely symptom-free, no more than twice weekly. Stop for pain, dizziness, weakness, numbness, or radiating symptoms.":
    "Chỉ tập tùy chọn khi hoàn toàn không có triệu chứng, tối đa hai lần mỗi tuần. Dừng lại nếu đau, chóng mặt, yếu, tê hoặc có triệu chứng lan tỏa.",
  "Over-arching and using the lower back": "Ưỡn quá mức và dùng lưng dưới",
  "Over-arching the lower back": "Ưỡn lưng dưới quá mức",
  "Over-arching the lower back at the top": "Ưỡn lưng dưới quá mức ở đỉnh",
  "Over-arching to move heavier bells": "Ưỡn quá mức để di chuyển tạ nặng hơn",
  "Over-reaching and hyperextending the elbow":
    "Vươn vai quá xa và duỗi khuỷu tay quá mức",
  "Overhead dumbbell triceps extension": "Duỗi tay sau qua đầu với tạ đơn",
  "Overhead extensions can flare the ribs and arch the back. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Các động tác duỗi tay qua đầu dễ làm xương sườn ưỡn mở và lưng bị ưỡn. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Overhead pressing tempts the ribs to flare. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Đẩy tạ qua đầu dễ làm xương sườn ưỡn mở. Giữ xương sườn hạ, cơ bụng căng, cơ mông siết nhẹ và cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Overhead triceps extension": "Duỗi tay sau qua đầu",
  "Overhead triceps extension with the elbows tracking forward":
    "Duỗi tay sau qua đầu với khuỷu tay hướng về trước",
  "Overhead work tempts the ribs to flare and the back to arch. Keep ribs down and abs braced.":
    "Các động tác qua đầu dễ làm xương sườn ưỡn mở và lưng bị ưỡn. Giữ xương sườn hạ và cơ bụng gồng chắc.",
  "Overreaching the shoulder at the bottom":
    "Vươn vai quá xa ở vị trí thấp nhất",
  "Own the pause before returning": "Kiểm soát chắc điểm dừng trước khi trở về",
  "Pad the back knee and place the rear foot against a wall or bench.":
    "Lót đệm dưới gối sau và đặt bàn chân sau tựa vào tường hoặc ghế.",
  "Partial lateral raise": "Nâng tay sang ngang một phần biên độ",
  "Partial reps": "Các lần tập một phần biên độ",
  "Pause and squeeze the calves at the top.": "Dừng và siết bắp chân ở đỉnh.",
  "Pause as the shoulder blades draw together.":
    "Dừng khi hai xương bả vai kéo lại gần nhau.",
  "Pause at the top, then lower without bouncing.":
    "Dừng ở đỉnh, rồi hạ xuống mà không nảy.",
  "Pause before the shoulders roll forward or feel strained.":
    "Dừng trước khi vai cuộn về trước hoặc thấy căng khó chịu.",
  "Pause briefly as the dumbbells reach the torso.":
    "Dừng một lúc khi tạ đơn đến sát thân.",
  "Pause briefly without leaning back or swinging.":
    "Dừng một lúc mà không ngả ra sau hoặc đung đưa.",
  "Pause briefly without shifting the hips away from the wall.":
    "Dừng một lúc mà không dịch hông ra khỏi tường.",
  "Pause briefly without shrugging the shoulders.":
    "Dừng một lúc mà không nhún vai.",
  "Pause briefly, then lower without swinging.":
    "Dừng một lúc, rồi hạ xuống mà không đung đưa.",
  "Pause motionless without relaxing into the chest.":
    "Dừng bất động mà không thả lỏng tạ đè lên ngực.",
  "Pause softly on the chest, stay tight, then press without bouncing.":
    "Dừng nhẹ trên ngực, giữ toàn thân căng rồi đẩy lên mà không nảy.",
  "Pause without letting the torso rotate.":
    "Dừng mà không để thân người xoay.",
  "Pause without rotating the pelvis or arching the lower back.":
    "Dừng mà không xoay khung chậu hoặc ưỡn lưng dưới.",
  "Paused barbell bench press": "Đẩy ngực tạ đòn có dừng",
  "Paused front squat": "Squat tạ trước ngực có dừng",
  "Paused heels-elevated goblet squat": "Goblet Squat kê gót cao có dừng",
  "Paused incline barbell press": "Đẩy tạ đòn ghế dốc lên có dừng",
  "Paused shoulder-width pull-up": "Hít xà tay rộng bằng vai có dừng",
  "Paused single-leg hip thrust": "Đẩy hông một chân có dừng",
  "Paused single-leg Romanian deadlift": "Deadlift Romania một chân có dừng",
  "Paused sumo deadlift": "Deadlift Sumo có dừng",
  "Paused wall tibialis raise": "Nâng mũi chân tựa tường có dừng",
  "Pec deck machine closing the arms in front of the chest":
    "Máy Pec Deck khép hai tay phía trước ngực",
  "Pelvic tilt on the floor": "Nghiêng khung chậu trên sàn",
  "Pelvic tilt with breathing": "Nghiêng khung chậu kết hợp hít thở",
  "Pendlay row": "Kéo tạ đòn Pendlay",
  "Pike push-up in an A-shape with hips high":
    "Chống đẩy chữ V với hông cao tạo hình chữ A",
  "Piking the hips up": "Nâng hông nhô lên",
  "Place a weight across the hips (padded).": "Đặt tạ ngang hông và lót đệm.",
  "Place both heels evenly on a stable low support with the feet about shoulder-width.":
    "Đặt đều hai gót chân trên một điểm tựa thấp, vững chắc với hai chân rộng khoảng bằng vai.",
  "Place equal dumbbells beside the feet and lift them with a safe hinge.":
    "Đặt hai tạ đơn bằng nhau cạnh bàn chân và dùng kỹ thuật gập hông an toàn để nâng lên.",
  "Place hands slightly wider than shoulder-width.":
    "Đặt hai tay rộng hơn vai một chút.",
  "Place the balls of the feet on a stable edge and secure dumbbells on the thighs.":
    "Đặt phần đầu bàn chân trên một mép vững chắc và giữ tạ đơn chắc chắn trên đùi.",
  "Place the entire working foot on the elevated surface.":
    "Đặt toàn bộ bàn chân bên tập lên bề mặt kê cao.",
  "Place the hands close so the index fingers and thumbs form a diamond.":
    "Đặt hai tay gần nhau để ngón trỏ và ngón cái tạo thành hình kim cương.",
  "Place the hands just inside shoulder width.":
    "Đặt hai tay hẹp hơn vai một chút.",
  "Place the whole foot on the step": "Đặt toàn bộ bàn chân lên bục",
  "Place your feet on a bench or sturdy surface.":
    "Đặt hai chân lên ghế hoặc một bề mặt chắc chắn.",
  "Placing the front foot too close": "Đặt chân trước quá gần",
  "Placing the hands so close that the wrists hurt":
    "Đặt hai tay quá sát khiến cổ tay bị đau",
  "Placing the working foot too far away": "Đặt chân bên tập quá xa",
  "Plank + glute squeeze": "Plank kèm siết cơ mông",
  "Plank, then squeeze the glutes to tuck the pelvis flat.":
    "Vào tư thế Plank, rồi siết cơ mông để thu khung chậu về vị trí phẳng.",
  "Plant the whole foot and let the elevated leg do the work.":
    "Đặt chắc toàn bộ bàn chân và để chân kê cao thực hiện công việc.",
  "Plant the working foot beneath the knee":
    "Đặt chắc bàn chân bên tập ngay dưới đầu gối",
  "Plant your feet and keep a stable ribcage.":
    "Đặt chắc hai bàn chân và giữ lồng ngực ổn định.",
  "Poking the chin toward the bar": "Rướn cằm về phía thanh xà",
  "Position a stable bench, pad the Smith bar over the hips, and set the machine safeties.":
    "Đặt ghế vững chắc, lót đệm cho thanh máy Smith ngang hông và cài chốt an toàn của máy.",
  "Posterior pelvic tilt flattening the lower back":
    "Nghiêng khung chậu ra sau để ép phẳng lưng dưới",
  "Practice bounce (no rope)": "Tập bật nhịp không dùng dây",
  "Practice forward, backward, lateral, pivot, and angle-exit steps while maintaining stance width.":
    "Tập bước tới, bước lùi, bước ngang, xoay trụ và thoát góc trong khi duy trì độ rộng thế đứng.",
  "Practice low submaximal jumps and quiet landings":
    "Tập các cú bật thấp dưới mức tối đa và tiếp đất nhẹ nhàng",
  "Practice low-box landings": "Tập tiếp đất trên bục thấp",
  "Practice slips, rolls, pivots, and exits with immediate guard and stance recovery.":
    "Tập né, lách, xoay trụ và thoát góc, lập tức trở lại thế thủ và thế đứng.",
  "Preacher curl with the upper arm on the pad":
    "Cuốn tạ trên ghế Preacher với cánh tay trên tựa vào đệm",
  "Press along the bar path while allowing the shoulder blade to rotate naturally.":
    "Đẩy theo đường đi của thanh và để xương bả vai xoay tự nhiên.",
  "Press along the machine path and return to a comfortable chest stretch.":
    "Đẩy theo quỹ đạo của máy rồi trở về vị trí cơ ngực được kéo giãn thoải mái.",
  "Press back up to the tall pike position.":
    "Đẩy người trở lại tư thế Pike cao.",
  "Press back up while still squeezing the bells together.":
    "Đẩy trở lên trong khi vẫn ép hai tạ sát nhau.",
  "Press back up without dropping the hips.": "Đẩy trở lên mà không hạ hông.",
  "Press back up without letting the hips sag.":
    "Đẩy trở lên mà không để hông võng xuống.",
  "Press evenly through both hands": "Đẩy đều bằng cả hai tay",
};
