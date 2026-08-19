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
  "Step Touch": "Bước ngang chạm chân",
  "Standing Knee Raise": "Nâng gối đứng",
  "Low-Impact Jumping Jack": "Jumping Jack nhẹ, ít tác động",
  "Easy Treadmill Cool-Down Walk": "Đi bộ nhẹ trên máy để thả lỏng",
  "Stationary Cycling": "Đạp xe tại chỗ",
  "Bodyweight Step-Up": "Bước lên bục bằng trọng lượng cơ thể",
  "Incline Push-Up": "Chống đẩy nghiêng",
  "Elliptical Cardio": "Cardio với máy Elliptical",
  "Standing Punches": "Đấm tay khi đứng",
  "Bodyweight Reverse Lunge": "Chùng chân lùi bằng trọng lượng cơ thể",
  "Standing Knee-to-Elbow": "Đưa gối chạm khuỷu tay khi đứng",

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
  "Bring the knee and opposite elbow together by rotating the trunk without pulling the neck.":
    "Đưa gối và khuỷu tay đối diện lại gần nhau bằng cách xoay thân mà không kéo cổ.",
  "Keep a straight head-to-heel line as the chest moves toward the support.":
    "Giữ cơ thể thành một đường thẳng từ đầu đến gót chân khi hạ ngực về phía điểm tựa.",
  "Pedal smoothly with the knees tracking forward and the hips steady.":
    "Đạp đều, giữ đầu gối hướng về trước và hông ổn định.",
  "Plant the whole lead foot and rise through that leg without pushing off the floor.":
    "Đặt toàn bộ bàn chân trụ lên bục và đứng lên bằng chân đó mà không đạp chân dưới sàn.",
  "Punch smoothly from a balanced stance and return each hand to guard.":
    "Đấm nhịp nhàng từ tư thế thăng bằng và thu từng tay về thế thủ.",
  "Reduce the speed and incline gradually while keeping an easy natural stride.":
    "Giảm dần tốc độ và độ dốc trong khi duy trì sải chân tự nhiên, nhẹ nhàng.",
  "Stand tall and lift one knee without leaning back or rushing.":
    "Đứng thẳng và nâng một gối mà không ngả ra sau hoặc thực hiện quá nhanh.",
  "Step back with control, keep the front foot planted, and track the front knee.":
    "Bước lùi có kiểm soát, giữ bàn chân trước bám sàn và đầu gối trước thẳng hướng.",
  "Step one foot out at a time while the arms travel overhead; do not jump.":
    "Lần lượt bước từng chân sang bên khi hai tay đưa qua đầu; không bật nhảy.",
  "Step side to side with soft knees and bring the trailing foot in without hopping.":
    "Bước sang hai bên với đầu gối hơi chùng và đưa chân sau vào mà không bật nhảy.",
  "Use a light grip, steady posture, and smooth pressure through each pedal.":
    "Nắm tay cầm nhẹ, giữ tư thế ổn định và đạp đều qua từng bàn đạp.",
  "Adjust the seat for a soft knee bend at the bottom of the pedal stroke and secure the feet.":
    "Điều chỉnh yên để đầu gối hơi chùng ở điểm thấp nhất của vòng đạp và cố định bàn chân.",
  "Alternate controlled straight punches with light hip rotation and quick guard recovery.":
    "Luân phiên đấm thẳng có kiểm soát, xoay hông nhẹ và nhanh chóng thu tay về thế thủ.",
  "Bend the elbows to lower the chest toward the surface, then press back to straight arms.":
    "Gập khuỷu tay để hạ ngực về phía điểm tựa, sau đó đẩy lên đến khi tay thẳng.",
  "Choose a dry, stable surface low enough to keep the knee and pelvis controlled.":
    "Chọn bề mặt khô, chắc chắn và đủ thấp để kiểm soát đầu gối cùng khung chậu.",
  "Do not snap the elbows straight or reach farther than balance allows.":
    "Không khóa bật khuỷu tay hoặc với xa hơn khả năng giữ thăng bằng.",
  "Do not step off a moving belt; stop the machine if you feel dizzy or unsteady.":
    "Không bước khỏi băng chạy đang chuyển động; dừng máy nếu thấy chóng mặt hoặc mất thăng bằng.",
  "Drive through the elevated foot to stand tall, then step down slowly and repeat.":
    "Đạp qua bàn chân trên bục để đứng thẳng, sau đó bước xuống chậm rãi và lặp lại.",
  "Keep a soft bend in the knees and use only a comfortable shoulder range.":
    "Giữ đầu gối hơi chùng và chỉ đưa vai trong biên độ thoải mái.",
  "Keep the steps small and controlled if balance or joint comfort is limited.":
    "Bước ngắn và có kiểm soát nếu khả năng thăng bằng hoặc độ thoải mái của khớp bị hạn chế.",
  "Lift one knee as the opposite elbow rotates toward it, return to standing, and alternate sides.":
    "Nâng một gối khi khuỷu tay đối diện xoay về phía đó, trở lại tư thế đứng rồi đổi bên.",
  "Lift one knee toward hip height, lower it softly, and alternate sides under control.":
    "Nâng một gối về phía ngang hông, hạ nhẹ nhàng rồi luân phiên hai bên có kiểm soát.",
  "Move slowly and reduce the range if balance or the lower back feels uncomfortable.":
    "Di chuyển chậm và giảm biên độ nếu mất thăng bằng hoặc lưng dưới khó chịu.",
  "Move the pedals and handles in a smooth reciprocal rhythm at a sustainable effort.":
    "Di chuyển bàn đạp và tay cầm theo nhịp luân phiên mượt mà ở mức gắng sức bền vững.",
  "Pedal at a comfortable cadence with manageable resistance and a relaxed upper body.":
    "Đạp ở nhịp thoải mái với lực cản vừa sức và thả lỏng thân trên.",
  "Place both hands on a stable elevated surface and walk the feet back into a firm plank.":
    "Đặt hai tay lên bề mặt cao chắc chắn rồi bước chân ra sau vào tư thế plank vững.",
  "Recheck the seat if the hips rock or the knees feel compressed or painful.":
    "Kiểm tra lại vị trí yên nếu hông lắc hoặc đầu gối cảm thấy bị ép hay đau.",
  "Reduce the depth or use support if balance is uncertain or the knee feels painful.":
    "Giảm độ sâu hoặc dùng điểm tựa nếu chưa giữ được thăng bằng hoặc đầu gối bị đau.",
  "Set the treadmill to a slow, flat or nearly flat pace and use the rails only to step on safely.":
    "Đặt máy chạy bộ ở tốc độ chậm, độ dốc bằng phẳng hoặc gần bằng phẳng và chỉ dùng tay vịn để bước lên an toàn.",
  "Slow the machine completely and keep hold of the handles before stepping off.":
    "Giảm tốc máy hoàn toàn và tiếp tục giữ tay cầm trước khi bước xuống.",
  "Stand close to a stable low step or box and place the whole working foot on top.":
    "Đứng gần một bục thấp chắc chắn và đặt toàn bộ bàn chân làm việc lên trên.",
  "Stand in a relaxed staggered stance with soft knees, hands up, and clear space ahead.":
    "Đứng so le thoải mái, đầu gối hơi chùng, hai tay nâng lên và chừa khoảng trống phía trước.",
  "Stand tall with the feet hip-width apart and clear space on both sides.":
    "Đứng thẳng, hai bàn chân rộng bằng hông và chừa khoảng trống ở cả hai bên.",
  "Stand tall with the feet hip-width apart and the hands resting lightly beside the head.":
    "Đứng thẳng, hai chân rộng bằng hông và đặt nhẹ hai tay bên đầu.",
  "Stand tall with the feet hip-width apart and use nearby support if needed.":
    "Đứng thẳng, hai chân rộng bằng hông và dùng điểm tựa gần đó nếu cần.",
  "Stand with the feet hip-width apart near a stable support if needed.":
    "Đứng hai chân rộng bằng hông gần một điểm tựa chắc chắn nếu cần.",
  "Stand with the feet together, arms by the sides, and clear space around you.":
    "Đứng khép chân, hai tay dọc thân người và chừa khoảng trống xung quanh.",
  "Step one foot back, lower both knees comfortably, and drive through the front foot to return.":
    "Bước một chân ra sau, hạ cả hai gối trong biên độ thoải mái rồi đạp qua chân trước để trở về.",
  "Step one foot out as the arms rise, bring it back in, and alternate sides smoothly.":
    "Bước một chân sang bên khi hai tay nâng lên, đưa chân về rồi luân phiên hai bên nhịp nhàng.",
  "Step onto the pedals carefully, take the handles, and select easy resistance.":
    "Bước lên bàn đạp cẩn thận, nắm tay cầm và chọn lực cản nhẹ.",
  "Step to one side, touch the other foot beside it, then repeat in the opposite direction.":
    "Bước sang một bên, đưa chân kia vào chạm nhẹ rồi lặp lại theo hướng đối diện.",
  "Use a comfortable knee height and hold support if balance is uncertain.":
    "Chỉ nâng gối đến độ cao thoải mái và vịn điểm tựa nếu chưa giữ được thăng bằng.",
  "Use a surface that cannot slide and a height that keeps the shoulders comfortable.":
    "Dùng bề mặt không trượt và độ cao giúp vai luôn thoải mái.",
  "Walk easily until breathing settles, then slow the belt fully before stepping off.":
    "Đi nhẹ nhàng đến khi nhịp thở ổn định, sau đó giảm băng chạy về tốc độ thấp nhất trước khi bước xuống.",
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
    "Giữ cổ thoải mái, kiểm soát xương sườn và giữ cột sống trung tính. Không cố tăng biên độ bằng cách rướn cằm hoặc ưỡn lưng dưới quá mức.",
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
    "Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện đau nhói.",
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
  "Bench dip": "Dips trên ghế (Bench Dip)",
  "Bodyweight squat": "Squat không tạ",
  "Build repeatable rounds or repetitions":
    "Tăng dần đến các hiệp hoặc số lần có thể lặp lại ổn định",
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
  "Stop 1-2 reps before form breaks":
    "Dừng khi còn 1–2 lần nữa trước khi kỹ thuật bắt đầu hỏng",
  "Abs tight": "Siết chặt cơ bụng",
  "Arching and flaring the ribs": "Ưỡn lưng và để xương sườn nhô lên",
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
    "Giữ cánh tay trên cố định và duỗi tay mà không ưỡn lưng dưới.",
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
    "Giữ thanh đòn có đệm và kết thúc khi hông duỗi thẳng mà không ưỡn lưng quá mức.",
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
    "Giữ đầu gối gần thẳng nhưng không khóa khớp và dừng ở cả hai đầu biên độ cổ chân.",
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
    "Giữ khung chậu trên đệm và chỉ hạ đến mức lưng vẫn ổn định.",
  "Keep the ribs down and drive to level hips using the glutes.":
    "Giữ xương sườn hạ xuống và dùng cơ mông đẩy hông đến vị trí duỗi thẳng.",
  "Keep the shoulder blades controlled and press the dumbbells evenly.":
    "Kiểm soát bả vai và đẩy hai tạ đơn đều nhau.",
  "Keep the stance balanced, move without crossing the feet, and reset after angles.":
    "Giữ thế đứng thăng bằng, không bắt chéo chân khi di chuyển và ổn định lại tư thế sau mỗi lần đổi góc.",
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
  "Keep the torso tall": "Giữ thân người thẳng",
  "Keep the upper arm behind the torso while curling without shoulder movement.":
    "Giữ cánh tay trên ở sau thân người khi cuốn cáp mà không di chuyển vai.",
  "Keep the upper arms on the pad and control the lengthened bottom position.":
    "Giữ cánh tay trên tựa trên đệm và kiểm soát vị trí cơ được kéo dài ở dưới cùng.",
  "Keep the upper arms steady and ribs down as the elbows straighten.":
    "Giữ cánh tay trên ổn định và xương sườn hạ xuống khi duỗi thẳng khuỷu tay.",
  "Keep the wrist stacked, recover the hands quickly, and prioritize clean mechanics.":
    "Giữ cổ tay thẳng hàng, thu tay về nhanh và ưu tiên kỹ thuật chuẩn.",
  "Keep upper arms still": "Giữ cánh tay trên cố định",
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
  "Longer rounds": "Các hiệp dài hơn",
  "Low step-up": "Bước lên bục thấp",
  "Lower all the way under control.": "Hạ hết biên độ có kiểm soát.",
  "Lower under control": "Hạ xuống có kiểm soát",
  "Lower under control to full elbow extension.":
    "Hạ xuống có kiểm soát đến khi khuỷu tay duỗi hoàn toàn.",
  "Machine press": "Đẩy máy",
  "Neutral spine head to heels":
    "Giữ cơ thể thẳng từ đầu đến gót chân và cột sống trung tính",
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
    "Đẩy lên và ra trước trong khi giữ lồng ngực thẳng hàng với khung chậu.",
  "Prone Y hold": "Giữ tay chữ Y nằm sấp",
  "Pull lightly toward the face while keeping the neck long and ribs quiet.":
    "Kéo nhẹ về phía mặt trong khi giữ cổ dài và xương sườn ổn định.",
  "Pull the elbows down toward the ribs.":
    "Kéo khuỷu tay xuống về phía xương sườn.",
  "Pull the light band apart without flaring the ribs or shrugging.":
    "Kéo dãn dây kháng lực nhẹ mà không để xương sườn nhô lên hoặc nhún vai.",
  "Pull the neutral handles toward the upper chest without leaning back.":
    "Kéo tay cầm trung tính về phía ngực trên mà không ngả ra sau.",
  "Punch smoothly, recover the guard quickly, and stay balanced after combinations.":
    "Ra đòn mượt mà, nhanh chóng thu tay về thế thủ và giữ thăng bằng sau các tổ hợp đòn.",
  "Push the hips back and keep the dumbbells close to the legs.":
    "Đẩy hông ra sau và giữ tạ đơn sát chân.",
  "Pushing through the toes": "Dồn lực qua mũi chân",
  "Reach through the upper back while the ribs and pelvis remain controlled.":
    "Vươn ngực xuống bằng cách duỗi lưng trên, đồng thời giữ xương sườn và khung chậu ổn định.",
  "Reach upward smoothly while the ribs stay stacked and the neck stays relaxed.":
    "Vươn lên mượt mà trong khi giữ lồng ngực thẳng hàng và cổ thư giãn.",
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
  "Shorter rounds": "Các hiệp ngắn hơn",
  "Shorter walk": "Quãng đi bộ ngắn hơn",
  "Shrugging the shoulders up": "Nhún vai lên",
  "Single-leg glute bridge": "Nâng hông một chân",
  "Squeeze at the top": "Siết cơ ở vị trí trên cùng",
  "Squeeze press": "Đẩy tạ ép sát (Squeeze Press)",
  "Squeeze the biceps at the top.": "Siết cơ tay trước ở vị trí trên cùng.",
  "Stand tall and resist leaning toward or away from the load.":
    "Đứng thẳng, không nghiêng về phía tạ hoặc ra xa tạ.",
  "Start with shoulders down": "Bắt đầu với vai hạ xuống",
  "Static split squat": "Split Squat tại chỗ",
  "Static suitcase hold": "Giữ tạ một bên tại chỗ",
  "Stay against the backrest and press without flaring the ribs.":
    "Giữ người sát tựa lưng và đẩy mà không để xương sườn nhô lên.",
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
    "Giữ vai và hông hướng thẳng về điểm tựa rồi kéo một tay mà không vặn người.",
  "Stay square on the high incline and resist rotating as one arm presses.":
    "Giữ thân người ngay ngắn trên ghế dốc cao và chống xoay khi đẩy một tay.",
  "Stay square while pressing the cable away from the chest.":
    "Giữ thân người ngay ngắn khi đẩy cáp ra xa ngực.",
  "Stay supported and row the handles without bouncing off the pad.":
    "Giữ người tựa chắc và kéo tay cầm mà không nảy khỏi đệm.",
  "Stay supported on the high incline and press without flaring the ribs.":
    "Giữ người tựa chắc trên ghế dốc cao và đẩy mà không để xương sườn nhô lên.",
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
  "Use short rounds": "Tập theo các hiệp ngắn",
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
    "Chỉnh ghế và vị trí bắt đầu để cánh tay trên được đỡ thoải mái.",
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
    "Neo dây ngang tầm ngực và đứng xoay ngang người so với điểm neo ở tư thế thăng bằng.",
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
    "Gắn tay cầm đã chọn vào cáp thấp và đứng thẳng người với hai tay duỗi.",
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
    "Bắt đầu ở thế thủ thăng bằng và mỗi lần chỉ chọn một động tác phòng thủ để tập.",
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
  "Bent-knee raise": "Nâng chân co gối",
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
  "Bounce without the rope": "Bật nhảy nhẹ không dùng dây",
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
    "Siết cơ lõi trước khi nâng và giữ cột sống trung tính khi hông và vai cùng đi lên. Kết thúc bằng cách siết cơ mông để duỗi thẳng hông, không ngả người ra sau.",
  "Brace before lifting one foot a few centimetres from the floor.":
    "Siết thân trước khi nhấc một chân lên cách sàn vài xăng-ti-mét.",
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
    "Giữ thân người chắc ở góc gần song song với sàn và kéo từng lần từ trạng thái tạ dừng hoàn toàn mà không dựng người lên.",
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
    "Hoàn thành lần chống đẩy, sau đó đẩy sàn ra xa thêm một chút để hai bả vai trượt ra trước và ôm quanh lồng ngực.",
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
  "Crashing the upper arm into the floor": "Đập mạnh cánh tay trên xuống sàn",
  "Cross-body hammer curl": "Cuốn tạ búa chéo người",
  "Cup one dumbbell vertically at the chest and set a stable squat stance.":
    "Ôm một tạ đơn thẳng đứng trước ngực và vào tư thế squat vững.",
  "Curl one or both dumbbells up.": "Cuốn một hoặc cả hai tạ đơn lên.",
  "Curl the bar up by bending the elbows.":
    "Gập khuỷu tay để cuốn thanh đòn lên.",
  "Curl the dumbbells up without rotating the wrists.":
    "Cuốn tạ đơn lên mà không xoay cổ tay.",
  "Curl the dumbbells while keeping the upper arms still.":
    "Cuốn tạ đơn trong khi giữ cánh tay trên cố định.",
  "Curl the handle toward the shoulders and lower until the elbows straighten under control.":
    "Cuốn tay cầm về phía vai rồi hạ xuống đến khi khuỷu tay duỗi có kiểm soát.",
  "Curl the handle while keeping the upper arm quiet, then lower to a comfortable long-muscle position.":
    "Cuốn tay cầm trong khi giữ cánh tay trên cố định, sau đó hạ đến vị trí cơ được kéo dài thoải mái.",
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
    "Cuốn tạ mà không nhấc cánh tay trên, sau đó hạ chậm và dừng trước khi khuỷu tay duỗi khóa quá mạnh.",
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
    "Nhún nhanh, bật thẳng lên và hấp thụ lực khi tiếp đất trước khi ổn định lại hoàn toàn tư thế.",
  "Do not bounce": "Không dùng đà nảy",
  "Do not chase range by arching the lower back or throwing the head back.":
    "Không cố tăng biên độ bằng cách ưỡn lưng dưới hoặc ngửa đầu ra sau.",
  "Do not chase speed": "Không cố chạy theo tốc độ",
  "Do not collapse forward": "Không đổ sụp ra trước",
  "Do not create range by rounding or overextending the spine.":
    "Không tạo thêm biên độ bằng cách cong hoặc ưỡn cột sống quá mức.",
  "Do not descend farther than the pelvis and lower back can remain supported.":
    "Không hạ sâu hơn mức khung chậu và lưng dưới vẫn được nâng đỡ.",
  "Do not flare the lower back": "Không để lưng dưới ưỡn lên",
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
    "Không để tạ kéo đầu gối duỗi bật đến tư thế khóa khớp quá mạnh.",
  "Do not make every round maximal; stop if wrist alignment or technique deteriorates.":
    "Không tập hiệp nào cũng ở mức tối đa; dừng lại nếu cổ tay lệch hoặc kỹ thuật sa sút.",
  "Do not overstretch the shoulders": "Không kéo giãn vai quá mức",
  "Do not rotate the torso": "Không xoay thân người",
  "Do not shrug the traps": "Không nhún vai bằng cơ thang",
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
    "Dùng cơ mông đẩy thanh đòn lên, dừng khi hông duỗi thẳng rồi hạ xuống có kiểm soát.",
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
    "Đạp qua hai bàn chân để duỗi hông đến vị trí thẳng rồi hạ xuống mà không mất kiểm soát xương sườn.",
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
    "Duỗi hông đến vị trí thẳng có kiểm soát, dừng lại rồi hạ xuống mượt mà.",
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
    "Kết thúc khi đứng thẳng, giữ hai bên hông ngang bằng và kiểm soát đầu gối chân tập.",
  "Finish tall without leaning back":
    "Kết thúc khi đứng thẳng mà không ngả ra sau",
  "Finish with a flat, level hip. Keep the ribs down and glutes squeezed; do not hyperextend the lower back at lockout.":
    "Kết thúc khi hông duỗi thẳng, thân và đùi tạo thành một đường ngang. Giữ xương sườn hạ xuống và siết cơ mông; không ưỡn lưng dưới quá mức ở vị trí duỗi hết hông.",
  "Finish with easy lengths and exit the pool carefully.":
    "Kết thúc bằng vài lượt bơi nhẹ và rời bể cẩn thận.",
  "Finish with the arm beside the ear and ribs controlled.":
    "Kết thúc với cánh tay sát tai và giữ xương sườn ổn định.",
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
  "Flaring the ribs and arching the back": "Để xương sườn nhô lên và ưỡn lưng",
  "Flaring the ribs during the inhale": "Để xương sườn nhô lên khi hít vào",
  "Flaring the ribs to finish overhead":
    "Để xương sườn nhô lên nhằm hoàn tất động tác qua đầu",
  "Flaring the ribs to finish the press":
    "Để xương sườn nhô lên nhằm hoàn tất động tác đẩy",
  "Flaring the ribs upward": "Để xương sườn nhô lên",
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
    "Đẩy hông đến vị trí duỗi thẳng hoàn toàn",
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
    "Giữ thân người thẳng hàng trong khi hít thở bình thường, rồi đổi bên.",
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
  "Hyperextending at lockout": "Ưỡn lưng quá mức ở cuối động tác",
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
    "Kéo xà thấp với thân người dốc hơn (thanh xà cao hơn)",
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
    "Giữ cột sống phẳng, trung tính trong suốt động tác gập hông và tránh giật người sang tư thế ưỡn khi kết thúc. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
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
  "Keep both hips square": "Giữ khung chậu thẳng, không xoay",
  "Keep both hips square and the dumbbells close to the standing leg.":
    "Giữ khung chậu thẳng, không xoay và giữ tạ đơn sát chân trụ.",
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
  "Keep ribs down (do not flare)": "Giữ xương sườn hạ xuống (không để nhô lên)",
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
    "Siết chắc cơ lõi và hạ xương sườn khi đưa người vào tư thế dốc ngược để tải trọng dồn vào vai, không phải lưng dưới.",
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
    "Giữ đầu, lồng ngực và khung chậu thẳng hàng sát tường. Chuyển động phải xuất phát từ cổ chân thay vì đung đưa cơ thể.",
  "Keep the heels planted and pull the toes toward the shins.":
    "Giữ gót chân trên sàn và kéo mũi chân về phía ống chân.",
  "Keep the hips high and stacked":
    "Giữ hông cao và hai bên hông xếp chồng thẳng hàng",
  "Keep the hips level": "Giữ hông ngang bằng",
  "Keep the hips lifted and pelvis level as the heels slide.":
    "Giữ hông nâng cao và khung chậu ngang bằng khi trượt gót chân.",
  "Keep the hips lifted while the upper torso rotates under control.":
    "Giữ hông nâng cao trong khi xoay thân trên có kiểm soát.",
  "Keep the hips square": "Giữ khung chậu thẳng, không xoay",
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
    "Giữ cổ dài, lồng ngực tựa chắc và vai xa tai trong khi cơ thang dưới dẫn chuyển động của bả vai.",
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
    "Giữ xương sườn và khung chậu ổn định khi tay chân chuyển động. Vươn chân thấp hơn và xa hơn nếu nâng chân làm lưng bị ưỡn.",
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
    "Giữ lồng ngực thẳng hàng với khung chậu",
  "Keep the ribs stacked over the pelvis and lean as one unit; do not side-bend or arch to lift the dumbbell.":
    "Giữ lồng ngực thẳng hàng với khung chậu và nghiêng cả người như một khối; không gập người sang bên hoặc ưỡn lưng để nâng tạ đơn.",
  "Keep the ribs stacked over the pelvis and rotate through the upper torso while the waist stays lifted. This builds lateral core control without side-bending the lower back.":
    "Giữ lồng ngực thẳng hàng với khung chậu và xoay thân trên trong khi eo vẫn nâng cao. Động tác này phát triển khả năng kiểm soát cơ lõi bên mà không gập lưng dưới sang bên.",
  "Keep the ribs stacked over the pelvis and the upper back tall. Brace instead of leaning back or rounding to hold the bar.":
    "Giữ lồng ngực thẳng hàng với khung chậu và lưng trên thẳng. Siết thân thay vì ngả ra sau hoặc cong lưng để giữ thanh đòn.",
  "Keep the ribs stacked, hips square, and front knee aligned. A slight forward torso angle is fine if the spine stays neutral.":
    "Giữ lồng ngực thẳng hàng với khung chậu, giữ khung chậu không xoay và đầu gối trước thẳng hàng. Có thể hơi nghiêng thân về trước miễn là cột sống vẫn trung tính.",
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
    "Giữ thân người thẳng và đầu gối trước đi theo hướng ngón chân.",
  "Keep the torso tall with ribs down and core braced; avoid arching the lower back as you stand.":
    "Giữ thân người thẳng, xương sườn hạ và cơ lõi gồng chắc; tránh ưỡn lưng dưới khi đứng lên.",
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
  "Leaning back on the belt": "Ngả người ra sau khi đi trên băng chạy",
  "Leaning back to cheat the rep": "Ngả ra sau để lấy đà cho lần tập",
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
  "Letting the ribs flare": "Để xương sườn nhô lên",
  "Letting the weight swing": "Để tạ đung đưa",
  "Letting the working knee cave inward": "Để đầu gối chân tập đổ vào trong",
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
  "Lifting the hips into a bridge": "Nâng hông thành tư thế Glute Bridge",
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
    "Di chuyển nhẹ nhàng, xoay thân bằng cơ lõi và giữ thế thủ.",
  "Light overhead dumbbell extension": "Duỗi tay sau qua đầu với tạ đơn nhẹ",
  "Light overhead extension": "Duỗi tay sau qua đầu với mức tạ nhẹ",
  "Light suitcase carry": "Xách tạ nhẹ một bên đi bộ",
  "Light weighted chin-up": "Hít xà tay ngửa với tạ nhẹ",
  "Light, controlled load": "Mức tạ nhẹ, dễ kiểm soát",
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
    "Hạ tạ về lại vai mà không để xương sườn nhô lên.",
  "Lower both knees while keeping the hips square and torso controlled.":
    "Hạ cả hai đầu gối trong khi giữ khung chậu thẳng, không xoay và kiểm soát thân người.",
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
    "Giữ cột sống trung tính và vững chắc; thiết lập lại độ siết thân người khi tạ còn trên sàn trước mỗi lần. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
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
    "Giữ thân người siết chắc, xương sườn hạ xuống và xoay thân bằng cơ lõi. Tránh vươn quá xa vì sẽ gây căng vai và lưng dưới.",
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
    "Các động tác duỗi tay qua đầu có thể làm xương sườn nhô lên và lưng bị ưỡn. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Overhead pressing tempts the ribs to flare. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Đẩy tạ qua đầu dễ khiến xương sườn nhô lên. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện cơn đau nhói.",
  "Overhead triceps extension": "Duỗi tay sau qua đầu",
  "Overhead triceps extension with the elbows tracking forward":
    "Duỗi tay sau qua đầu với khuỷu tay hướng về trước",
  "Overhead work tempts the ribs to flare and the back to arch. Keep ribs down and abs braced.":
    "Các động tác qua đầu dễ khiến xương sườn nhô lên và lưng bị ưỡn. Giữ xương sườn hạ xuống và siết chắc cơ bụng.",
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
    "Vào tư thế Plank, rồi siết cơ mông để cuộn khung chậu và làm phẳng lưng dưới.",
  "Plant the whole foot and let the elevated leg do the work.":
    "Đặt chắc toàn bộ bàn chân và dồn lực qua chân trên bục.",
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
  "Press evenly through both hands to the start.":
    "Đẩy đều qua cả hai tay để trở về vị trí ban đầu.",
  "Press gently into the hand without moving the neck, breathe normally, then change directions.":
    "Nhẹ nhàng ấn vào bàn tay mà không cử động cổ, thở bình thường rồi đổi hướng.",
  "Press over the chest and lower until the shoulders remain comfortable and controlled.":
    "Đẩy lên phía trên ngực rồi hạ xuống đến mức vai vẫn thoải mái và kiểm soát được.",
  "Press overhead under control": "Đẩy qua đầu có kiểm soát",
  "Press overhead while keeping the torso centered.":
    "Đẩy qua đầu trong khi giữ thân người ở chính giữa, không nghiêng lệch.",
  "Press the dumbbell up with the wrist stacked over the elbow.":
    "Đẩy tạ đơn lên, giữ cổ tay thẳng hàng trên khuỷu tay.",
  "Press the dumbbells firmly into each other.": "Ép chặt hai tạ đơn vào nhau.",
  "Press the dumbbells hard together the whole set.":
    "Ép mạnh hai tạ đơn vào nhau trong suốt hiệp.",
  "Press the dumbbells overhead under control.":
    "Đẩy tạ đơn qua đầu có kiểm soát.",
  "Press the floor away through the forearm": "Dùng cẳng tay đẩy sàn ra xa",
  "Press the floor away while keeping the hips level.":
    "Đẩy sàn ra xa trong khi giữ hai bên hông ngang bằng.",
  "Press the handle straight out, resist the cable rotation, and return under control.":
    "Đẩy tay cầm thẳng ra, chống lại lực xoay của cáp rồi thu về có kiểm soát.",
  "Press the hands away from the sternum, pause without rotating, and return slowly.":
    "Đẩy hai tay ra xa xương ức, dừng lại mà không xoay người rồi từ từ thu về.",
  "Press the lower back down": "Ép lưng dưới xuống",
  "Press the lower back firmly into the floor.": "Ép chắc lưng dưới xuống sàn.",
  "Press the lower back flat first": "Ép phẳng lưng dưới trước",
  "Press the lower back flat, then lift shoulders and legs.":
    "Ép phẳng lưng dưới rồi nâng vai và chân lên.",
  "Press the lower back gently toward the floor.":
    "Nhẹ nhàng ép lưng dưới về phía sàn.",
  "Press the lower back into the floor.": "Ép lưng dưới xuống sàn.",
  "Press the lower back to the floor": "Ép lưng dưới sát sàn",
  "Press the lower back to the floor, lower legs only as far as you can hold it.":
    "Ép lưng dưới sát sàn, chỉ hạ chân đến mức bạn vẫn giữ được tư thế đó.",
  "Press the supporting hand into the mat": "Ấn tay trụ xuống thảm",
  "Press through a symptom-free overhead arc and lower with the wrists stacked over the elbows.":
    "Đẩy lên theo cung qua đầu không gây triệu chứng rồi hạ xuống với cổ tay thẳng hàng trên khuỷu tay.",
  "Press through the balls of the feet to raise the heels fully.":
    "Đạp qua phần trước bàn chân để nâng gót lên hết biên độ.",
  "Press through the palms back to lockout.":
    "Đẩy qua lòng bàn tay để trở lại vị trí duỗi thẳng tay.",
  "Press through the toes, pause, and lower the heels without letting the feet slip.":
    "Đẩy qua các ngón chân, dừng lại rồi hạ gót mà không để bàn chân trượt.",
  "Press up and slightly in without clashing the bells.":
    "Đẩy lên và hơi hướng vào trong mà không để hai tạ va nhau.",
  "Press up onto the toes through a full range.":
    "Đẩy người lên đầu ngón chân hết biên độ.",
  "Press up while keeping the hips on the bench.":
    "Đẩy lên trong khi giữ hông trên ghế.",
  "Press up without bouncing or over-arching.":
    "Đẩy lên mà không nảy người hoặc ưỡn lưng quá mức.",
  "Press up without lifting the hips or shrugging.":
    "Đẩy lên mà không nhấc hông hoặc nhún vai.",
  "Press upward along a comfortable arc and lower with the wrists stacked over the elbows.":
    "Đẩy lên theo cung thoải mái rồi hạ xuống với cổ tay thẳng hàng trên khuỷu tay.",
  "Press upward while keeping both shoulders against the bench, then lower under control.":
    "Đẩy lên trong khi giữ cả hai vai áp vào ghế rồi hạ xuống có kiểm soát.",
  "Press with a top pause": "Đẩy và dừng ở vị trí trên cùng",
  "Press without forceful lockout and return until the shoulders remain comfortable.":
    "Đẩy lên mà không khóa khớp mạnh rồi thu về đến mức vai vẫn thoải mái.",
  "Press without locking forcefully and lower until the shoulders remain comfortable.":
    "Đẩy lên mà không khóa khớp mạnh rồi hạ đến mức vai vẫn thoải mái.",
  "Press without twisting": "Đẩy mà không vặn người",
  "Pressing forward instead of overhead": "Đẩy ra trước thay vì qua đầu",
  "Pressing the dumbbells too far forward": "Đẩy tạ đơn quá xa về phía trước",
  "Pressing through the toes instead of the heels":
    "Đạp qua ngón chân thay vì gót chân",
  "Pressing unevenly from side to side": "Đẩy không đều giữa hai bên",
  "Prone Y-raise": "Nâng tay chữ Y nằm sấp",
  "Pull back with the abs and lats": "Dùng cơ bụng và cơ xô kéo về",
  "Pull elbows toward ribs": "Kéo khuỷu tay về phía xương sườn",
  "Pull elbows toward the hips": "Kéo khuỷu tay về phía hông",
  "Pull it toward the hip, leading with the elbow.":
    "Kéo tạ về phía hông, dẫn chuyển động bằng khuỷu tay.",
  "Pull the bar quickly toward the lower chest.":
    "Kéo nhanh thanh đòn về phía ngực dưới.",
  "Pull the bar toward the lower ribs.":
    "Kéo thanh đòn về phía xương sườn dưới.",
  "Pull the chest to the bar": "Kéo ngực về phía xà",
  "Pull the chest toward the bar without kicking.":
    "Kéo ngực về phía xà mà không đá chân.",
  "Pull the chest toward the bar without swinging.":
    "Kéo ngực về phía xà mà không đung đưa.",
  "Pull the chest toward the bar, squeezing the shoulder blades.":
    "Kéo ngực về phía xà đồng thời siết hai bả vai.",
  "Pull the chest toward the handles and lower through a comfortable full range.":
    "Kéo ngực về phía tay cầm rồi hạ xuống hết biên độ thoải mái.",
  "Pull the dumbbell back over the chest under control.":
    "Kéo tạ đơn trở lại phía trên ngực có kiểm soát.",
  "Pull the elbow toward the hip": "Kéo khuỷu tay về phía hông",
  "Pull the elbow toward the hip while resisting trunk rotation, then reach forward slowly.":
    "Kéo khuỷu tay về phía hông trong khi chống xoay thân người, rồi từ từ vươn tay ra trước.",
  "Pull the elbows toward the hips without lifting the chest.":
    "Kéo khuỷu tay về phía hông mà không nhấc ngực lên.",
  "Pull the heels back with the hamstrings, then reset under control.":
    "Dùng cơ đùi sau kéo gót chân về rồi trở lại có kiểm soát.",
  "Pull the slack from the bar": "Kéo hết độ chùng khỏi thanh đòn",
  "Pull toward the eyebrows with the elbows open, then return until the shoulder blades reach.":
    "Kéo về phía lông mày với khuỷu tay mở, rồi thu về đến khi hai bả vai vươn ra.",
  "Pull toward the lower chest": "Kéo về phía ngực dưới",
  "Pull toward the lower ribs": "Kéo về phía xương sườn dưới",
  "Pull toward the lower ribs, pause briefly, and lower until the shoulder blades spread.":
    "Kéo về phía xương sườn dưới, dừng ngắn rồi hạ xuống đến khi hai bả vai tách ra.",
  "Pull toward the upper ribs": "Kéo về phía xương sườn trên",
  "Pull with the hamstrings": "Kéo bằng cơ đùi sau",
  "Pull-up with a neutral hammer grip on parallel handles":
    "Hít xà với tay nắm trung tính kiểu búa trên hai tay cầm song song",
  "Pulling only with the hands": "Chỉ kéo bằng tay",
  "Pulling to the chest instead of the belly": "Kéo về ngực thay vì bụng",
  "Pulling toward the hips with tucked elbows":
    "Kéo về phía hông với khuỷu tay khép sát",
  "Pulling unevenly through the feet": "Dùng lực không đều qua hai bàn chân",
  "Pullover with slow eccentric": "Pullover với pha hạ tạ chậm",
  "Push the floor away to stand while keeping the elbows high.":
    "Đẩy sàn ra xa để đứng lên trong khi giữ khuỷu tay cao.",
  "Push the hips back along the bar path, then stand once the hamstrings reach their controlled limit.":
    "Đẩy hông ra sau dọc theo đường đi của thanh đòn, rồi đứng lên khi cơ đùi sau đạt giới hạn kiểm soát được.",
  "Push the hips back, lowering the weight down the legs.":
    "Đẩy hông ra sau, hạ tạ dọc theo chân.",
  "Push through the whole supported foot to stand tall.":
    "Đạp qua toàn bộ bàn chân trụ để đứng thẳng người.",
  "Push up without letting the lower back sag.":
    "Đẩy người lên mà không để lưng dưới võng xuống.",
  "Push-up position with an added shoulder-blade protraction":
    "Tư thế chống đẩy kèm đưa bả vai ra trước",
  "Push-up with a weighted backpack on the upper back":
    "Chống đẩy với ba lô có tạ đặt trên lưng trên",
  "Pushing hard from the trailing foot": "Đẩy quá mạnh bằng chân sau",
  "Pushing into a high bridge": "Đẩy hông lên tư thế cầu quá cao",
  "Pushing mainly from the back foot": "Dồn lực đẩy chủ yếu từ chân sau",
  "Pushing mostly through the toes": "Dồn lực đẩy chủ yếu qua các ngón chân",
  "Pushing off the back foot": "Đạp bật bằng chân sau",
  "Pushing the hips forward without the shoulders":
    "Đẩy hông ra trước mà vai không đi cùng",
  "Pushing the hips too high": "Đẩy hông lên quá cao",
  "Pushing through the feet instead of tilting":
    "Đẩy qua bàn chân thay vì nghiêng khung chậu",
  "Put the backpack on securely so it does not slide.":
    "Đeo ba lô chắc chắn để không bị trượt.",
  "Quadruped brace": "Siết cơ lõi ở tư thế bốn điểm",
  "Raise the arm toward shoulder height, then lower slowly across the body.":
    "Nâng tay lên ngang vai rồi từ từ hạ chéo qua trước thân người.",
  "Raise the arms out to the sides using the rear delts.":
    "Dùng vai sau nâng hai tay sang hai bên.",
  "Raise the arms out to the sides with a fixed elbow bend, then lower slowly.":
    "Nâng hai tay sang hai bên, giữ nguyên độ gập khuỷu rồi từ từ hạ xuống.",
  "Raise the heels, pause, and lower slowly into a comfortable stretch.":
    "Nâng gót lên, dừng lại rồi từ từ hạ xuống đến độ giãn thoải mái.",
  "Raise the knees by curling the pelvis, pause, and lower without losing control.":
    "Cuộn khung chậu để nâng gối, dừng lại rồi hạ xuống mà không mất kiểm soát.",
  "Raise the legs toward the ceiling with the abs.":
    "Dùng cơ bụng nâng chân về phía trần nhà.",
  "Raise the straight legs only as high as the torso stays controlled.":
    "Chỉ nâng chân thẳng đến độ cao mà thân người vẫn ổn định.",
  "Raise with the rear delts": "Nâng bằng vai sau",
  "Raising above shoulder height": "Nâng cao quá vai",
  "Raising far above shoulder height": "Nâng cao hơn vai quá nhiều",
  "Raising the torso as the bar leaves the floor":
    "Nâng thân người khi thanh đòn vừa rời sàn",
  "Reach a comfortable full range without rolling the shoulders forward.":
    "Vươn hết biên độ thoải mái mà không cuộn vai ra trước.",
  "Reach fully at the bottom": "Vươn hết ở vị trí dưới cùng",
  "Reach into a wide Y with thumbs up and lift from the shoulder blades.":
    "Vươn tay thành chữ Y rộng với ngón cái hướng lên rồi nâng từ bả vai.",
  "Reach long instead of lifting high": "Vươn dài thay vì nâng cao",
  "Reach long through the arms": "Vươn dài qua hai tay",
  "Reach long, pause, and keep the pelvis square to the floor.":
    "Vươn dài, dừng lại và giữ khung chậu song song với sàn.",
  "Reach one arm and the opposite leg away from the body.":
    "Vươn một tay và chân đối diện ra xa cơ thể.",
  "Reach only within your control": "Chỉ vươn trong phạm vi bạn kiểm soát được",
  "Reach the arms into a wide Y with the thumbs pointing up.":
    "Vươn hai tay thành chữ Y rộng với ngón cái hướng lên.",
  "Reach the free leg back, keep the hips square, and hinge as one unit.":
    "Vươn chân tự do ra sau, giữ khung chậu thẳng, không xoay và gập hông như một khối.",
  "Reach the free leg straight back": "Vươn thẳng chân tự do ra sau",
  "Reach the highest clean position without craning the neck.":
    "Vươn đến vị trí cao nhất vẫn đúng kỹ thuật mà không ngửa cổ.",
  "Reach the top arm under the ribs by rotating the upper torso.":
    "Xoay thân trên để luồn tay phía trên xuống dưới xương sườn.",
  "Reaching the weights toward the floor": "Vươn tạ về phía sàn",
  "Reaching too far too soon": "Vươn quá xa quá sớm",
  "Rear delt raise with pause": "Nâng tạ vai sau có dừng",
  "Rear foot kept lower": "Giữ chân sau ở vị trí thấp hơn",
  "Rear-delt dumbbell row": "Kéo tạ đơn cho vai sau",
  "Rear-delt fly pulling the arms back and apart":
    "Ép vai sau bằng cách kéo hai tay ra sau và tách sang hai bên",
  "Rear-delt raise lying chest-down on an incline bench":
    "Nâng tạ vai sau khi nằm sấp trên ghế dốc",
  "Rear-delt row with pause": "Kéo tạ cho vai sau có dừng",
  "Reduce the load if the lower back arches or the pelvis leaves the pad.":
    "Giảm mức tạ nếu lưng dưới ưỡn hoặc khung chậu rời khỏi đệm.",
  "Reduce the load if the shoulders roll forward or the torso leans back.":
    "Giảm mức tạ nếu vai cuộn ra trước hoặc thân người ngả ra sau.",
  "Reduce the load if the torso sways or the shoulder shrugs.":
    "Giảm mức tạ nếu thân người đung đưa hoặc vai nhún lên.",
  "Reduce the load if the torso twists or the shoulder shrugs.":
    "Giảm mức tạ nếu thân người vặn xoắn hoặc vai nhún lên.",
  "Regress the arm or leg position if the back arches.":
    "Giảm độ khó của vị trí tay hoặc chân nếu lưng bị ưỡn.",
  "Relax the neck and shoulders": "Thả lỏng cổ và vai",
  "Relaxing the upper back at the chest":
    "Thả lỏng lưng trên khi thanh chạm ngực",
  "Release and engage the machine stop only while the heels are supported.":
    "Chỉ nhả và gài chốt máy khi gót chân đang được đỡ chắc.",
  "Reset any swing between reps": "Dừng hết đà đung đưa giữa các lần",
  "Reset the brace every rep": "Siết lại cơ lõi ở mỗi lần",
  "Reset the bridge height as needed":
    "Điều chỉnh lại độ cao tư thế cầu khi cần",
  "Resist side-bending and keep the ribs stacked over the pelvis throughout the single-arm press. Keep ribs down, abs tight, glutes slightly squeezed, and a neutral spine. Do not over-arch your lower back. Stop if sharp pain appears.":
    "Chống nghiêng người sang bên và giữ lồng ngực thẳng hàng với khung chậu trong suốt động tác đẩy một tay. Giữ xương sườn hạ xuống, siết chặt cơ bụng, siết nhẹ cơ mông và giữ cột sống trung tính. Không ưỡn lưng dưới quá mức. Dừng lại nếu xuất hiện đau nhói.",
  "Rest or change strokes before technique becomes strained.":
    "Nghỉ hoặc đổi kiểu bơi trước khi kỹ thuật bắt đầu gượng ép.",
  "Rest the back foot on a bench behind you.": "Đặt chân sau lên ghế phía sau.",
  "Rest the bar across the front shoulders and set the feet about shoulder-width.":
    "Đặt thanh đòn ngang vai trước và để hai chân rộng khoảng bằng vai.",
  "Rest the upper back on a bench, feet flat on the floor.":
    "Tựa lưng trên vào ghế, đặt bàn chân phẳng trên sàn.",
  "Return and repeat on the other side.": "Trở về rồi lặp lại ở bên kia.",
  "Return slowly and alternate sides.": "Từ từ trở về và luân phiên hai bên.",
  "Return the bar under control and reset before the next rep.":
    "Đưa thanh đòn về có kiểm soát và chỉnh lại tư thế trước lần tiếp theo.",
  "Return to a stable open position without dropping the hips.":
    "Trở về tư thế mở vững chắc mà không để hông hạ xuống.",
  "Return without twisting": "Trở về mà không vặn người",
  "Reverse crunch curling the hips off the floor":
    "Gập bụng ngược bằng cách cuộn hông khỏi sàn",
  "Reverse crunch with hip lift": "Gập bụng ngược kèm nâng hông",
  "Reverse lunge holding dumbbells at the sides":
    "Lunge lùi, cầm tạ đơn hai bên người",
  "Reverse lunge with the bar on the upper back":
    "Lunge lùi với thanh đòn trên lưng trên",
  "Reverse pec deck machine opening the arms back":
    "Máy ép ngực đảo chiều với động tác mở hai tay ra sau",
  "Rhythm-focused songs": "Các bài nhạc tập trung vào nhịp điệu",
  "Ribs down on the bench": "Giữ xương sườn hạ xuống trên ghế",
  "Ribs down, controlled tempo": "Giữ xương sườn hạ xuống, nhịp có kiểm soát",
  "Ribs down, do not flare": "Giữ xương sườn hạ xuống, không để nhô lên",
  "Ribs down, glutes squeezed": "Giữ xương sườn hạ xuống, siết cơ mông",
  "Ribs down, no swinging": "Giữ xương sườn hạ xuống, không đung đưa",
  "Ribs down, press overhead without flaring the lower back.":
    "Giữ xương sườn hạ xuống, đẩy qua đầu mà không ưỡn lưng dưới.",
  "Ribs flaring up": "Xương sườn nhô lên",
  "Rise as high as controlled, pause, and lower the heels into a comfortable stretch.":
    "Nhón lên cao hết mức kiểm soát được, dừng lại rồi hạ gót đến độ giãn thoải mái.",
  "Rise onto the ball of the foot, pause, and lower into a comfortable calf stretch.":
    "Nhón lên phần trước bàn chân, dừng lại rồi hạ xuống đến độ giãn bắp chân thoải mái.",
  "Rise through full range": "Nhón lên hết biên độ",
  "Rocking forward and lifting the heels": "Dồn người ra trước và nhấc gót",
  "Roll forward slowly while keeping the hips and ribs connected.":
    "Từ từ lăn về trước trong khi giữ hông và xương sườn liên kết.",
  "Roll only as far as the ribs and pelvis stay stacked.":
    "Chỉ lăn đến mức lồng ngực vẫn thẳng hàng với khung chậu.",
  "Rolling farther than the core can control":
    "Lăn xa hơn mức cơ lõi có thể kiểm soát",
  "Rolling onto the outside of the foot": "Lăn bàn chân ra mép ngoài",
  "Rolling the ankles outward": "Lật cổ chân ra ngoài",
  "Rolling the pelvis toward the floor": "Xoay khung chậu về phía sàn",
  "Rolling toward the working side": "Nghiêng xoay về bên đang tập",
  "Romanian deadlift": "Deadlift kiểu Romania",
  "Romanian deadlift hinging with a near-straight bar path":
    "Deadlift kiểu Romania với động tác gập hông và đường thanh đòn gần như thẳng",
  "Romanian deadlift hip hinge with a flat back":
    "Deadlift kiểu Romania, gập hông với lưng phẳng",
  "Romanian deadlift with dumbbells and long hamstrings":
    "Deadlift kiểu Romania với tạ đơn và cơ đùi sau được kéo dài",
  "Rotate through the core, not just the arms":
    "Xoay bằng cơ lõi, không chỉ bằng tay",
  "Rotate through the upper torso": "Xoay qua thân trên",
  "Rotating or dropping one side of the pelvis":
    "Xoay hoặc hạ một bên khung chậu",
  "Rotating the torso forward": "Xoay thân người ra trước",
  "Rotating the wrist mid-rep": "Xoay cổ tay giữa lần thực hiện",
  "Rounding the back while hinged": "Cong lưng khi gập hông",
  "Rounding the lower back at the bottom": "Cong lưng dưới ở vị trí dưới cùng",
  "Rounding the lower back off the floor":
    "Cong lưng dưới khi kéo tạ rời khỏi sàn",
  "Rounding the spine": "Cong cột sống",
  "Row the elbows toward the torso without lifting the chest from the pad.":
    "Kéo khuỷu tay về phía thân người mà không nhấc ngực khỏi đệm.",
  "Row through the elbows, pause without leaning, and return under control.":
    "Kéo bằng khuỷu tay, dừng lại mà không nghiêng người rồi trở về có kiểm soát.",
  "Row toward the lower ribs, allow a controlled reach, and keep the torso angle steady.":
    "Kéo về phía xương sườn dưới, cho bả vai vươn ra có kiểm soát và giữ ổn định góc thân người.",
  "Row toward the upper ribs with the elbows angled out.":
    "Kéo về phía xương sườn trên với khuỷu tay hướng chếch ra ngoài.",
  "Rushing and losing balance": "Thực hiện quá vội và mất thăng bằng",
  "Rushing side to side": "Đổi bên quá vội",
  "Rushing the return to standing": "Vội vàng trở lại tư thế đứng",
  "Rushing through the rotation": "Xoay người quá vội",
  "Seated cable row station used one arm at a time":
    "Máy kéo cáp ngồi, tập từng tay một",
  "Seated cable row with an upright torso": "Kéo cáp ngồi với thân người thẳng",
  "Seated calf raise": "Nhón bắp chân ngồi",
  "Seated calf raise machine with the pads on the thighs":
    "Máy nhón bắp chân ngồi với đệm đặt trên đùi",
  "Seated chest press machine": "Máy đẩy ngực ngồi",
  "Seated chest-supported row on a machine": "Kéo máy ngồi có tựa ngực",
  "Seated curl": "Cuốn tạ ngồi",
  "Seated dumbbell calf raise": "Nhón bắp chân ngồi với tạ đơn",
  "Seated dumbbell shoulder press": "Đẩy vai tạ đơn ngồi",
  "Seated dumbbell shoulder press against a back pad":
    "Đẩy vai tạ đơn ngồi tựa lưng vào đệm",
  "Seated hammer curl": "Cuốn tạ búa ngồi",
  "Seated leg extension machine": "Máy duỗi gối ngồi",
  "Seated machine row with the chest against the pad":
    "Kéo máy ngồi với ngực áp vào đệm",
  "Seated overhead press pressing straight up":
    "Đẩy qua đầu ngồi, đẩy thẳng lên",
  "Seated pelvic tilt": "Nghiêng khung chậu khi ngồi",
  "Seated press with back support": "Đẩy tạ ngồi có tựa lưng",
  "Seated toe raise": "Nâng mũi chân khi ngồi",
  "Secure a light added load so it cannot swing.":
    "Cố định chắc mức tạ nhẹ thêm vào để tạ không đung đưa.",
  "Secure the band low behind the body and bring the hands overhead with the elbows bent.":
    "Cố định dây thấp phía sau cơ thể và đưa hai tay qua đầu với khuỷu tay gập.",
  "Secure the bar in a landmine, face the sleeve, and hold it at shoulder height.":
    "Cố định thanh đòn vào Landmine, đứng hướng về đầu thanh và giữ ở ngang vai.",
  "Secure the dumbbell before starting": "Giữ chắc tạ đơn trước khi bắt đầu",
  "Secure the load close to the body": "Giữ chắc mức tạ sát cơ thể",
  "Secure the load, pull the chest up, and lower to a controlled full hang.":
    "Cố định chắc mức tạ, nâng ngực lên rồi hạ xuống tư thế treo người hoàn toàn có kiểm soát.",
  "Secure the thighs under the pad and take a palms-facing neutral grip.":
    "Cố định đùi dưới đệm và nắm tay trung tính với hai lòng bàn tay hướng vào nhau.",
  "Secure the upper back on the bench": "Tựa chắc lưng trên vào ghế",
  "Separate the hands until the band nears the chest, then return slowly.":
    "Tách hai tay cho đến khi dây gần chạm ngực rồi từ từ trở về.",
  "Set a bar at about hip height (or use a sturdy table).":
    "Đặt xà ở khoảng ngang hông (hoặc dùng bàn chắc chắn).",
  "Set a flat back roughly parallel to the floor.":
    "Giữ lưng phẳng và gần song song với sàn.",
  "Set a high incline, brace both feet, and hold one dumbbell at shoulder height.":
    "Chỉnh ghế dốc cao, trụ chắc hai chân và giữ một tạ đơn ở ngang vai.",
  "Set a high incline, plant the feet, and bring both dumbbells to a stable shoulder position.":
    "Chỉnh ghế dốc cao, đặt chắc hai chân và đưa hai tạ đơn vào vị trí ổn định ngang vai.",
  "Set a low cable, face away, and step forward with the working arm extended behind the torso.":
    "Chỉnh cáp thấp, quay lưng lại rồi bước lên trước với tay tập duỗi ra sau thân người.",
  "Set a low cable, stand side-on, and hold the handle with the outside hand.":
    "Chỉnh cáp thấp, đứng xoay ngang người so với máy và cầm tay cầm bằng tay phía ngoài.",
  "Set a small, fixed bend in the elbows.": "Giữ khuỷu tay hơi gập cố định.",
  "Set a stable split stance with the front foot forward.":
    "Vào tư thế đứng chân trước chân sau vững chắc.",
  "Set a walking pace with a moderate incline.":
    "Chọn tốc độ đi bộ với độ dốc vừa phải.",
  "Set an incline bench and lie face down with the chest supported.":
    "Chỉnh ghế dốc rồi nằm sấp với ngực được đỡ.",
  "Set an incline bench and sit with the upper back supported.":
    "Chỉnh ghế dốc rồi ngồi với lưng trên được tựa.",
  "Set both cables to the selected height and take a stable staggered stance between them.":
    "Chỉnh cả hai cáp đến độ cao đã chọn và đứng chân trước chân sau vững chắc ở giữa.",
  "Set both feet securely on the platform and release the safeties only after bracing.":
    "Đặt chắc cả hai chân trên bàn đạp và chỉ nhả chốt an toàn sau khi đã siết cơ lõi.",
  "Set hands slightly wider than shoulders.":
    "Đặt hai tay rộng hơn vai một chút.",
  "Set it down softly, then alternate without shifting the pelvis.":
    "Nhẹ nhàng đặt xuống rồi đổi bên mà không xê dịch khung chậu.",
  "Set shoulder blades back and down on the bench.":
    "Giữ bả vai kéo ra sau và hạ xuống trên ghế.",
  "Set the assistance and take a secure overhand grip on the pull-up handles.":
    "Chỉnh mức hỗ trợ và nắm úp chắc vào tay cầm hít xà.",
  "Set the bar over the mid-foot and hinge until the torso is nearly parallel.":
    "Đặt thanh đòn trên giữa bàn chân và gập hông đến khi thân người gần song song với sàn.",
  "Set the bench to a low or moderate incline.":
    "Chỉnh ghế ở độ dốc thấp hoặc vừa.",
  "Set the bench to a modest incline (about 30 degrees).":
    "Chỉnh ghế ở độ dốc vừa phải (khoảng 30 độ).",
  "Set the bench upright, sit with the upper back supported, and bring the dumbbells to shoulder height.":
    "Chỉnh lưng ghế thẳng, ngồi tựa lưng trên và đưa tạ đơn lên ngang vai.",
  "Set the body in one straight line.": "Giữ cơ thể thành một đường thẳng.",
  "Set the cable near chest height and stand side-on with the feet planted.":
    "Chỉnh cáp gần ngang ngực, đứng xoay ngang người so với máy và trụ chắc hai chân.",
  "Set the cables near shoulder height and take the opposite handle in each hand.":
    "Chỉnh cáp gần ngang vai và mỗi tay cầm tay cầm ở phía đối diện.",
  "Set the feet about shoulder-width, toes slightly out.":
    "Đặt hai chân rộng khoảng bằng vai, mũi chân hơi xoay ra ngoài.",
  "Set the feet securely on the platform and place the shoulders beneath the pads.":
    "Đặt chắc hai chân trên bàn đạp và đưa vai vào dưới đệm.",
  "Set the forearms under the shoulders.": "Đặt cẳng tay ngay dưới vai.",
  "Set the front foot far enough forward to feel stable.":
    "Đặt chân trước đủ xa để cảm thấy vững.",
  "Set the hands under the shoulders and knees under the hips.":
    "Đặt tay dưới vai và đầu gối dưới hông.",
  "Set the safeties and a stable low front platform, then center beneath the Smith bar.":
    "Chỉnh chốt an toàn và bục thấp phía trước thật vững, rồi đứng vào chính giữa dưới thanh máy Smith.",
  "Set the safeties, place the bar comfortably across the upper back, and position the feet.":
    "Chỉnh chốt an toàn, đặt thanh đòn thoải mái ngang lưng trên và đặt hai chân đúng vị trí.",
  "Set the safeties, place the rear foot on a bench, and center the front stance beneath the bar.":
    "Chỉnh chốt an toàn, đặt chân sau lên ghế và căn chân trước ở giữa dưới thanh đòn.",
  "Set the shoulder pads comfortably and place the balls of the feet securely on the platform.":
    "Chỉnh đệm vai cho thoải mái và đặt chắc phần trước bàn chân trên bàn đạp.",
  "Set the shoulders and drive the elbows down.":
    "Giữ chắc vai rồi kéo khuỷu tay xuống.",
  "Set the shoulders down and pull the elbows toward the ribs, then reach up under control.":
    "Hạ vai xuống và kéo khuỷu tay về phía xương sườn, rồi vươn lên có kiểm soát.",
  "Set the shoulders, then drive the elbows down without swinging.":
    "Giữ chắc vai rồi kéo khuỷu tay xuống mà không đung đưa.",
  "Set the Smith safeties and begin with the bar at the thighs in a stable hip-width stance.":
    "Chỉnh chốt an toàn máy Smith và bắt đầu với thanh đòn ở đùi, hai chân rộng bằng hông và vững chắc.",
  "Set the supporting elbow directly under the shoulder.":
    "Đặt khuỷu tay trụ ngay dưới vai.",
  "Set the upper back securely on a bench and plant one foot beneath its knee.":
    "Tựa chắc lưng trên lên ghế và đặt một bàn chân ngay dưới đầu gối.",
  "Set the weight down safely and repeat on the other side.":
    "Đặt tạ xuống an toàn rồi lặp lại ở bên kia.",
  "Set two equal, non-rolling supports and confirm they cannot move.":
    "Đặt hai điểm kê bằng nhau, không lăn và kiểm tra chắc chắn chúng không thể xê dịch.",
  "Set up a forearm plank with a straight body line.":
    "Vào tư thế Plank cẳng tay với cơ thể thành một đường thẳng.",
  "Setting the bench too steep": "Chỉnh ghế dốc quá cao",
  "Setting the speed too high": "Chỉnh tốc độ quá cao",
  "Setting the stance wider than the hips can control":
    "Đứng rộng hơn mức hông có thể kiểm soát",
  "Shallow deficit push-up": "Chống đẩy hạ sâu với biên độ nông",
  "Shift gently forward until you feel the front-of-hip stretch.":
    "Nhẹ nhàng dồn người ra trước đến khi cảm thấy phần trước hông được kéo giãn.",
  "Shifting all the weight to one side": "Dồn toàn bộ trọng lượng sang một bên",
  "Shifting the hips during each repetition":
    "Xê dịch hông trong mỗi lần thực hiện",
  "Short easy rounds": "Các hiệp ngắn, nhẹ nhàng",
  "Short easy swim with frequent rests":
    "Buổi bơi ngắn, nhẹ với nhiều lần nghỉ",
  "Short recovery walk": "Đi bộ phục hồi ngắn",
  "Short-hold side plank": "Plank nghiêng giữ trong thời gian ngắn",
  "Short-range barbell rollout": "Lăn tạ đòn biên độ ngắn",
  "Short-range bridge": "Nâng hông biên độ ngắn",
  "Short-range kneeling rollout": "Lăn tạ quỳ gối biên độ ngắn",
  "Short-range reach-through": "Luồn tay biên độ ngắn",
  "Short-range sliding hamstring curl": "Cuốn đùi sau trượt gót biên độ ngắn",
  "Short-range wall tibialis raise": "Nâng mũi chân tựa tường biên độ ngắn",
  "Short, choppy reps": "Các lần thực hiện ngắn và giật cục",
  "Shorten or skip the walk if full rest would aid recovery more.":
    "Rút ngắn hoặc bỏ buổi đi bộ nếu nghỉ hoàn toàn giúp phục hồi tốt hơn.",
  "Shorten the range before the back arches":
    "Rút ngắn biên độ trước khi lưng bị ưỡn",
  "Shorten the range if the shoulders roll forward or the neck tightens.":
    "Rút ngắn biên độ nếu vai cuộn ra trước hoặc cổ căng lên.",
  "Shorten the trunk by curling the ribs down, then return without shifting the hips.":
    "Gập ngắn thân người bằng cách cuộn xương sườn xuống rồi trở về mà không xê dịch hông.",
  "Shorter exhales": "Thở ra ngắn hơn",
  "Shorter hold": "Giữ trong thời gian ngắn hơn",
  "Shorter pool session": "Buổi tập trong hồ ngắn hơn",
  "Shoulder blades back and down, press without bouncing.":
    "Kéo bả vai ra sau và hạ xuống, đẩy tạ mà không nảy.",
  "Shoulder collapsing": "Vai bị sụp xuống",
  "Shoulder-width pull-up": "Hít xà tay rộng bằng vai",
  "Shoulders down, away from ears": "Hạ vai xuống, xa tai",
  "Shrugging aggressively at the top": "Nhún vai mạnh ở vị trí trên cùng",
  "Shrugging at lockout": "Nhún vai khi duỗi thẳng tay",
  "Shrugging instead of using the lower traps":
    "Nhún vai thay vì dùng cơ thang dưới",
  "Shrugging into the supporting shoulder": "Sụp người vào vai trụ",
  "Shrugging or rounding the shoulders": "Nhún vai hoặc cuộn tròn vai",
  "Shrugging the loaded shoulder": "Nhún bên vai chịu tạ",
  "Shrugging the shoulder up": "Nhún vai lên",
  "Shrugging toward the ears": "Nhún vai về phía tai",
  "Shrugging while rowing": "Nhún vai khi kéo",
  "Side plank": "Plank nghiêng",
  "Side plank with leg lift": "Plank nghiêng kèm nâng chân",
  "Side plank with stacked hips and lifted waist":
    "Plank nghiêng với hai bên hông xếp chồng và eo nâng khỏi sàn",
  "Side-lying hold": "Giữ tư thế nằm nghiêng",
  "Side-plank reach-through": "Plank nghiêng luồn tay",
  "Single light dumbbell extension": "Duỗi tay với một tạ đơn nhẹ",
  "Single-arm overhead extension": "Duỗi một tay qua đầu",
  "Single-leg bridge": "Nâng hông một chân",
  "Single-leg calf raise": "Nhón bắp chân một chân",
  "Single-leg RDL": "RDL một chân",
  "Single-leg Romanian deadlift": "Deadlift kiểu Romania một chân",
  "Single-leg seated dumbbell calf raise":
    "Nhón bắp chân ngồi một chân với tạ đơn",
  "Single-leg sliding hamstring curl": "Cuốn đùi sau trượt gót một chân",
  "Single-leg wall tibialis raise": "Nâng mũi chân tựa tường một chân",
  "Sit back with shoulder blades set down and back.":
    "Ngồi tựa ra sau với bả vai kéo xuống và ra sau.",
  "Sit down and back, keeping the knees tracking the toes.":
    "Hạ hông xuống và ra sau, giữ đầu gối đi theo hướng mũi chân.",
  "Sit or stand tall with the eyes level and the jaw relaxed.":
    "Ngồi hoặc đứng thẳng, mắt nhìn ngang và thả lỏng hàm.",
  "Sit or stand with dumbbells at shoulder height.":
    "Ngồi hoặc đứng với tạ đơn ở ngang vai.",
  "Sit tall and place a hand on the forehead, back, or side of the head for the selected direction.":
    "Ngồi thẳng và đặt một tay lên trán, sau đầu hoặc bên đầu tùy theo hướng đã chọn.",
  "Sit tall on a bench with the knees bent and feet about hip-width.":
    "Ngồi thẳng trên ghế, gập đầu gối và đặt hai chân rộng khoảng bằng hông.",
  "Sit tall with the feet braced and take the selected cable attachment.":
    "Ngồi thẳng, trụ chắc hai chân và nắm phụ kiện cáp đã chọn.",
  "Sit tall with the ribs over the pelvis and keep the feet and knees aligned while the ankles move through their full range.":
    "Ngồi thẳng với lồng ngực thẳng hàng với khung chậu, giữ bàn chân và đầu gối thẳng hàng khi cổ chân di chuyển hết biên độ.",
  "Sit the hips back and let the upper chest reach down through a comfortable thoracic range.":
    "Đưa hông ra sau và hạ ngực trên xuống trong biên độ cột sống ngực thoải mái.",
  "Sit with the knee pad secured above the knees and the balls of the feet on the platform.":
    "Ngồi với đệm gối được cố định phía trên đầu gối và phần trước bàn chân đặt trên bàn đạp.",
  "Skipping rope with small bounces on the balls of the feet":
    "Nhảy dây với các nhịp bật nhỏ trên phần trước bàn chân",
  "Skull crusher with slow eccentric": "Skull Crusher với pha hạ tạ chậm",
  "Slide the forearms upward while reaching gently into the wall, then return slowly.":
    "Trượt cẳng tay lên trên đồng thời nhẹ nhàng đẩy vào tường, rồi từ từ trở về.",
  "Slow down if breathing is no longer conversational or recovery is worsened.":
    "Giảm tốc nếu bạn không còn thở đủ nhẹ để trò chuyện hoặc khả năng phục hồi kém đi.",
  "Slow push-up": "Chống đẩy chậm",
  "Slow reach-through with a pause": "Luồn tay chậm có dừng",
  "Slow reverse crunch": "Gập bụng ngược chậm",
  "Slow-eccentric sliding hamstring curl":
    "Cuốn đùi sau trượt gót với pha duỗi chậm",
  "Slow-tempo dumbbell curl": "Cuốn tạ đơn nhịp chậm",
  "Slow-tempo lateral raise": "Nâng tạ sang ngang nhịp chậm",
  "Slow-tempo rear delt raise": "Nâng tạ vai sau nhịp chậm",
  "Slower flat walk": "Đi bộ đường bằng chậm hơn",
  "Slowly lower one arm and the opposite leg.":
    "Từ từ hạ một tay và chân đối diện.",
  "Slowly slide the heels away while keeping the pelvis level.":
    "Từ từ trượt gót ra xa trong khi giữ khung chậu ngang bằng.",
  "Small bounces on the balls of the feet, wrists do the turning.":
    "Bật nhẹ trên phần trước bàn chân, dùng cổ tay để quay dây.",
  "Small fixed elbow bend, open slowly, hug the chest together.":
    "Giữ khuỷu tay hơi gập cố định, từ từ mở ra rồi khép tay siết ngực.",
  "Small, controlled movement": "Chuyển động nhỏ, có kiểm soát",
  "Small, precise range": "Biên độ nhỏ, chính xác",
  "Smaller-range tilt": "Nghiêng khung chậu với biên độ nhỏ hơn",
  "Soft knees, not locked": "Đầu gối hơi chùng, không khóa khớp",
  "Split squat with the rear foot elevated on a bench":
    "Split Squat với chân sau kê cao trên ghế",
  "Squat along the fixed path to a controlled depth and stand without snapping the knees.":
    "Squat theo đường đi cố định đến độ sâu kiểm soát được rồi đứng lên mà không bật khóa đầu gối.",
  "Squat between the hips to a controlled depth and drive through the whole foot.":
    "Squat xuống giữa hai hông đến độ sâu kiểm soát được và đạp qua toàn bộ bàn chân.",
  "Squat holding a dumbbell in each hand": "Squat với mỗi tay cầm một tạ đơn",
  "Squat only as deep as you can keep the torso and pelvis controlled.":
    "Chỉ Squat sâu đến mức bạn vẫn kiểm soát được thân người và khung chậu.",
  "Squatting instead of hinging": "Squat xuống thay vì gập hông",
  "Squeeze at the top without rolling the shoulders forward.":
    "Siết ở vị trí trên cùng mà không cuộn vai ra trước.",
  "Squeeze forearms and biceps": "Siết cẳng tay và cơ tay trước",
  "Squeeze press with pause": "Đẩy tạ ép sát có dừng",
  "Squeeze the back-leg glute, tuck the pelvis, feel the front hip.":
    "Siết cơ mông chân sau, cuộn khung chậu và cảm nhận phần trước hông.",
  "Squeeze the chest at the top": "Siết cơ ngực ở vị trí trên cùng",
  "Squeeze the chest to bring the dumbbells back together.":
    "Siết cơ ngực để đưa hai tạ đơn lại gần nhau.",
  "Squeeze the forearms and biceps at the top.":
    "Siết cẳng tay và cơ tay trước ở vị trí trên cùng.",
  "Squeeze the glute on the back leg": "Siết cơ mông của chân sau",
  "Squeeze the glute on the back leg.": "Siết cơ mông của chân sau.",
  "Squeeze the glutes at the top": "Siết cơ mông ở vị trí trên cùng",
  "Squeeze the glutes before marching":
    "Siết cơ mông trước khi bước chân tại chỗ",
  "Squeeze the glutes lightly.": "Siết nhẹ cơ mông.",
  "Squeeze the glutes to gently tuck the pelvis.":
    "Siết cơ mông để nhẹ nhàng cuộn khung chậu.",
  "Squeeze the glutes to lift": "Siết cơ mông để nâng lên",
  "Squeeze the glutes to lift the hips.": "Siết cơ mông để nâng hông.",
  "Squeeze the glutes to lift, ribs down, no lower-back arch.":
    "Siết cơ mông để nâng lên, giữ xương sườn hạ xuống và không ưỡn lưng dưới.",
  "Squeeze the glutes to tuck the pelvis": "Siết cơ mông để cuộn khung chậu",
  "Squeeze the rear-leg glute": "Siết cơ mông chân sau",
  "Squeeze the shoulder blade": "Siết bả vai",
  "Squeeze the shoulder blades": "Siết hai bả vai",
  "Squeeze the working glute at the top without arching the lower back.":
    "Siết cơ mông bên tập ở vị trí trên cùng mà không ưỡn lưng dưới.",
  "Stable split stance, drop straight down, drive the front foot.":
    "Đứng chân trước chân sau vững chắc, hạ thẳng xuống và đạp mạnh bằng chân trước.",
  "Stack the body in one line": "Giữ cơ thể thẳng hàng",
  "Stack the body in one line, lift the hips, do not sag.":
    "Giữ cơ thể thẳng hàng, nâng hông lên và không để võng xuống.",
  "Stack the feet and hips.": "Xếp chồng hai bàn chân và hai bên hông.",
  "Stance too short (knee over toes)":
    "Sải chân quá ngắn (đầu gối vượt quá mũi chân)",
  "Stand close to a stable step or bench with a dumbbell in each hand.":
    "Đứng gần một bục hoặc ghế chắc chắn, mỗi tay cầm một tạ đơn.",
  "Stand evenly on both heels with the knees softly bent.":
    "Đứng dồn lực đều lên cả hai gót, đầu gối hơi chùng.",
  "Stand facing a wall with the forearms supported and the feet in a comfortable stance.":
    "Đứng hướng mặt vào tường, cẳng tay được đỡ và hai chân ở tư thế thoải mái.",
  "Stand in an athletic stance with clear space and knees tracking over the toes.":
    "Đứng ở tư thế thể thao trong khoảng trống, giữ đầu gối đi theo hướng mũi chân.",
  "Stand light on the balls of the feet with a slight knee bend.":
    "Đứng nhẹ trên phần trước bàn chân với đầu gối hơi chùng.",
  "Stand on a stable low platform with dumbbells at the sides and clear space behind.":
    "Đứng trên bục thấp chắc chắn, cầm tạ đơn hai bên và chừa khoảng trống phía sau.",
  "Stand on one foot near a stable support and hold a dumbbell in the other hand.":
    "Đứng một chân gần điểm tựa chắc chắn và cầm tạ đơn bằng tay đối diện.",
  "Stand on one leg with a soft knee and hold the dumbbells by the thighs.":
    "Đứng một chân với đầu gối hơi chùng và giữ tạ đơn cạnh đùi.",
  "Stand or sit holding dumbbells at the sides.":
    "Đứng hoặc ngồi, cầm tạ đơn hai bên người.",
  "Stand side-on to a solid throwing wall with a light medicine ball and clear rebound space.":
    "Đứng xoay ngang người so với bức tường chắc dùng để ném bóng, cầm bóng tạ nhẹ và chừa trống khu vực bóng bật lại.",
  "Stand tall by driving the hips forward, without over-arching.":
    "Đẩy hông ra trước để đứng thẳng mà không ưỡn lưng quá mức.",
  "Stand tall holding the barbell with an underhand grip.":
    "Đứng thẳng, cầm thanh đòn bằng tay nắm ngửa.",
  "Stand tall with a dumbbell at each side and the feet hip-width.":
    "Đứng thẳng, mỗi bên cầm một tạ đơn và hai chân rộng bằng hông.",
  "Stand tall with level shoulders and the ribs over the pelvis.":
    "Đứng thẳng với hai vai ngang bằng và lồng ngực thẳng hàng với khung chậu.",
  "Stand tall with light dumbbells at the sides.":
    "Đứng thẳng, cầm tạ đơn nhẹ hai bên người.",
  "Stand tall with ribs down and a neutral spine; keep the core lightly braced for balance.":
    "Đứng thẳng với xương sườn hạ xuống và cột sống trung tính; siết nhẹ cơ lõi để giữ thăng bằng.",
  "Stand tall with the weights beside the thighs.":
    "Đứng thẳng với tạ ở hai bên đùi.",
  "Stand tall without leaning back, then lower the bar under control.":
    "Đứng thẳng mà không ngả ra sau, rồi hạ thanh đòn có kiểm soát.",
  "Stand tall without over-arching": "Đứng thẳng mà không ưỡn lưng quá mức",
  "Stand tall, optionally with the balls of the feet on a step.":
    "Đứng thẳng, có thể đặt phần trước bàn chân lên bục.",
  "Stand tall, ribs down": "Đứng thẳng, giữ xương sườn hạ xuống",
  "Stand tall, ribs down, and take smooth steps.":
    "Đứng thẳng, giữ xương sườn hạ xuống và bước đều, mượt.",
  "Stand with both feet planted and hold one dumbbell at shoulder height.":
    "Đứng trụ chắc cả hai chân và giữ một tạ đơn ở ngang vai.",
  "Stand with one dumbbell held at the side and both feet planted evenly.":
    "Đứng cầm một tạ đơn bên người và trụ đều trên cả hai chân.",
  "Stand with two dumbbells at the thighs, feet hip-width, and knees softly bent.":
    "Đứng với hai tạ đơn ở đùi, hai chân rộng bằng hông và đầu gối hơi chùng.",
  "Standing cable curl with the elbows pinned":
    "Cuốn cáp đứng với khuỷu tay giữ cố định",
  "Standing calf raise machine with the shoulders under the pads":
    "Máy nhón bắp chân đứng với vai ở dưới đệm",
  "Standing dumbbell curl": "Cuốn tạ đơn đứng",
  "Standing dumbbell shoulder press": "Đẩy vai tạ đơn đứng",
  "Standing flat-footed": "Đứng với toàn bộ bàn chân chạm sàn",
  "Standing hip flexor stretch": "Giãn cơ gập hông đứng",
  "Standing hip-flexor stretch": "Giãn cơ gập hông đứng",
  "Standing one-arm dumbbell press": "Đẩy tạ đơn một tay đứng",
  "Standing partial rollout": "Lăn tạ biên độ một phần khi đứng",
  "Standing pelvic tilt": "Nghiêng khung chậu khi đứng",
  "Standing toe raise with support": "Nâng mũi chân đứng có hỗ trợ",
  "Standing up during each row": "Dựng người lên trong mỗi lần kéo",
  "Standing up more upright each rep": "Mỗi lần lại dựng thân người thẳng hơn",
  "Start at an easy pace that supports relaxed breathing.":
    "Bắt đầu ở nhịp nhẹ để có thể thở thoải mái.",
  "Start from a still hang, curl the pelvis up, and never swing.":
    "Bắt đầu từ tư thế treo yên, cuộn khung chậu lên và tuyệt đối không đung đưa.",
  "Start from a true dead stop": "Bắt đầu từ trạng thái dừng hoàn toàn",
  "Start in a push-up and walk the feet in to lift the hips high.":
    "Bắt đầu ở tư thế chống đẩy rồi bước chân vào gần để nâng hông cao.",
  "Start shoulders down, pull elbows toward the ribs.":
    "Bắt đầu với vai hạ xuống, kéo khuỷu tay về phía xương sườn.",
  "Start with dumbbells at the upper chest.": "Bắt đầu với tạ đơn ở ngực trên.",
  "Starting with the shoulders shrugged": "Bắt đầu với vai nhún lên",
  "Static farmer hold": "Giữ tạ hai bên tại chỗ",
  "Static side plank": "Giữ Plank nghiêng tĩnh",
  "Stay balanced mid-foot": "Giữ thăng bằng trên giữa bàn chân",
  "Stay balanced over the whole foot": "Giữ thăng bằng trên toàn bộ bàn chân",
  "Stay braced during the pause": "Giữ cơ lõi gồng chắc trong lúc dừng",
  "Stay centered over both feet": "Giữ trọng tâm ở giữa hai bàn chân",
  "Stay tall with ribs down and core braced; land softly to protect the shins and keep the spine neutral.":
    "Giữ người thẳng với xương sườn hạ xuống và cơ lõi siết chắc; tiếp đất nhẹ để bảo vệ ống chân và giữ cột sống trung tính.",
  "Stay tall with the ribs over the pelvis and keep the dumbbell close. Stop the descent before the lower back rounds or arches.":
    "Giữ người thẳng với lồng ngực thẳng hàng với khung chậu và tạ đơn sát cơ thể. Dừng hạ trước khi lưng dưới cong hoặc ưỡn.",
  "Stay tall with the ribs stacked and shoulders level. The load is too heavy if it pulls the torso forward or makes each step sway.":
    "Giữ người thẳng, lồng ngực thẳng hàng với khung chậu và hai vai ngang bằng. Mức tạ quá nặng nếu kéo thân người ra trước hoặc khiến từng bước bị lắc.",
  "Stay tall with the ribs stacked over the pelvis. Choose a height that lets you keep the knee aligned and the pelvis level.":
    "Giữ người thẳng với lồng ngực thẳng hàng với khung chậu. Chọn độ cao cho phép đầu gối thẳng hàng và khung chậu ngang bằng.",
  "Steeper incline walk": "Đi bộ với độ dốc cao hơn",
  "Step back with control and drive through the planted front foot.":
    "Bước lùi có kiểm soát rồi đạp qua chân trước đang trụ.",
  "Step back, lower through the front hip and knee, and drive through the elevated front foot.":
    "Bước lùi, hạ người qua hông và đầu gối chân trước rồi đạp qua chân trước đang kê cao.",
  "Step one foot back far enough to keep the front foot planted.":
    "Bước một chân đủ xa về sau để bàn chân trước vẫn trụ chắc.",
  "Step one foot back, descend on the front leg, and return without pushing from the rear foot.":
    "Bước một chân ra sau, hạ người trên chân trước rồi trở về mà không đẩy bằng chân sau.",
  "Step-throughs": "Bước chuyển chân liên tục",
  "Step-up with a controlled knee drive":
    "Bước lên bục kèm nâng gối có kiểm soát",
  "Stop at a flat hip, do not hyperextend":
    "Dừng khi hông duỗi thẳng, không duỗi quá mức",
  "Stop at about shoulder height.": "Dừng ở khoảng ngang vai.",
  "Stop at shoulder height": "Dừng ở ngang vai",
  "Stop before elbow discomfort": "Dừng trước khi khuỷu tay khó chịu",
  "Stop before elbow pain": "Dừng trước khi khuỷu tay đau",
  "Stop before lumbar position changes and keep the neck neutral throughout.":
    "Dừng trước khi tư thế lưng dưới thay đổi và luôn giữ cổ trung tính.",
  "Stop before shoulder pain": "Dừng trước khi vai đau",
  "Stop before shoulder support fails or the legs begin to swing.":
    "Dừng trước khi vai không còn giữ vững hoặc chân bắt đầu đung đưa.",
  "Stop before the hips drop or the lower back arches.":
    "Dừng trước khi hông hạ xuống hoặc lưng dưới bị ưỡn.",
  "Stop before the lower back begins to arch.":
    "Dừng trước khi lưng dưới bắt đầu ưỡn.",
  "Stop before the lower back rounds or the neck changes position.":
    "Dừng trước khi lưng dưới cong hoặc cổ đổi vị trí.",
  "Stop before the pelvis or lower back loses a comfortable neutral position.":
    "Dừng trước khi khung chậu hoặc lưng dưới mất vị trí trung tính thoải mái.",
  "Stop before the shoulders feel over-stretched.":
    "Dừng trước khi vai cảm thấy bị kéo giãn quá mức.",
  "Stop before the shoulders swing forward": "Dừng trước khi vai lao ra trước",
  "Stop if the hips sag": "Dừng nếu hông võng xuống",
  "Stop if the hips start to drop": "Dừng nếu hông bắt đầu hạ xuống",
  "Stop if the shins flare up": "Dừng nếu triệu chứng đau ống chân bùng lên",
  "Stop if the shins hurt": "Dừng nếu ống chân bị đau",
  "Stop just above the forehead.": "Dừng ngay phía trên trán.",
  "Stop just short of a hard lockout.": "Dừng ngay trước khi khóa khớp cứng.",
  "Stop level (no over-arch), then lower under control.":
    "Dừng khi hông ngang bằng (không ưỡn quá mức), rồi hạ xuống có kiểm soát.",
  "Stop the descent before the pelvis tucks or the lower back lifts from the pad.":
    "Dừng hạ trước khi khung chậu cuộn lại hoặc lưng dưới nhấc khỏi đệm.",
  "Stop under control and set both weights down safely.":
    "Dừng có kiểm soát và đặt cả hai tạ xuống an toàn.",
  "Stop when the body is straight from knees to shoulders.":
    "Dừng khi cơ thể thẳng từ đầu gối đến vai.",
  "Stop when the hamstring is loaded or the pelvis starts to rotate.":
    "Dừng khi cơ đùi sau đã căng chịu lực hoặc khung chậu bắt đầu xoay.",
  "Stop with a good shoulder position": "Dừng khi vai vẫn ở vị trí tốt",
  "Stopping short of full extension": "Dừng trước khi duỗi hết biên độ",
  "Straight line head to heels, ribs down, glutes squeezed.":
    "Giữ một đường thẳng từ đầu đến gót, xương sườn hạ xuống và siết cơ mông.",
  "Straighten the elbows along the cable path, then return to a comfortable stretch.":
    "Duỗi khuỷu tay theo đường cáp rồi trở về đến độ giãn thoải mái.",
  "Straighten the elbows until the hands pass the hips, then return under control.":
    "Duỗi khuỷu tay đến khi bàn tay qua hông rồi trở về có kiểm soát.",
  "Straighten the elbows without flaring the ribs.":
    "Duỗi khuỷu tay mà không để xương sườn nhô lên.",
  "Straighten the elbows without moving the upper arms, then return slowly.":
    "Duỗi khuỷu tay mà không di chuyển cánh tay trên rồi từ từ trở về.",
  "Straightening then re-bending the elbows": "Duỗi rồi lại gập khuỷu tay",
  "Straining the neck": "Gồng căng cổ",
  "Suitcase hold with a load in one hand and the torso square":
    "Giữ một tạ ở một bên khi đứng tại chỗ, giữ thân người thẳng, không nghiêng hoặc xoay",
  "Supine full-exhale breathing": "Thở ra hết khi nằm ngửa",
  "Support both feet on a wall or bench and gently pull the heels down.":
    "Đặt cả hai bàn chân lên tường hoặc ghế và nhẹ nhàng kéo gót xuống.",
  "Support the forearms on the chair pads, brace the back, and let the legs hang quietly.":
    "Tựa cẳng tay trên đệm ghế, giữ chắc lưng và để chân treo yên.",
  "Supported bodyweight single-leg hinge":
    "Gập hông một chân không tạ có hỗ trợ",
  "Supported couch stretch": "Giãn cơ gập hông tựa ghế có hỗ trợ",
  "Supported reverse lunge": "Lunge lùi có hỗ trợ",
  "Supported single-leg hip hinge": "Gập hông một chân có hỗ trợ",
  "Supported squat": "Squat có hỗ trợ",
  "Supported step-up": "Bước lên bục có hỗ trợ",
  "Supported stretch": "Kéo giãn có hỗ trợ",
  "Sweep the arms back through a comfortable arc and return without letting the stack slam.":
    "Quét hai tay ra sau theo cung thoải mái rồi trở về mà không để chồng tạ va mạnh.",
  "Sweep the arms outward with soft elbows and return until the rear delts lengthen.":
    "Quét hai tay ra ngoài với khuỷu hơi chùng rồi trở về đến khi vai sau được kéo dài.",
  "Sweep the hands together with soft elbows, then open to a comfortable chest stretch.":
    "Quét hai tay lại gần nhau với khuỷu hơi chùng, rồi mở ra đến độ giãn ngực thoải mái.",
  "Swinging or kipping": "Đung đưa hoặc dùng đà kipping",
  "Swinging or kipping for momentum": "Đung đưa hoặc kipping để lấy đà",
  "Swinging out of the bottom": "Đung đưa lấy đà từ vị trí dưới cùng",
  "Swinging the legs": "Đung đưa chân",
  "Swinging the torso for momentum": "Đung đưa thân người để lấy đà",
  "Swinging the torso to lift the bar": "Đung đưa thân người để nâng thanh đòn",
  "Swinging the weights": "Đung đưa tạ",
  "Swinging the weights up": "Vung tạ lên",
  "Swinging the weights up with momentum": "Vung tạ lên bằng đà",
  "T-bar row with the chest supported on the pad":
    "Kéo T-Bar với ngực tựa trên đệm",
  "Take a comfortable wide stance with the toes turned out and the bar over mid-foot.":
    "Đứng rộng thoải mái với mũi chân xoay ra ngoài và thanh đòn ở trên giữa bàn chân.",
  "Take a controlled step back": "Bước lùi có kiểm soát",
  "Take a relaxed boxing stance in clear space with the guard in a comfortable position.":
    "Vào tư thế boxing thả lỏng trong khoảng trống, giữ thế thủ ở vị trí thoải mái.",
  "Take a relaxed stance with clear space and choose a technical focus for the round.":
    "Đứng thả lỏng trong khoảng trống và chọn một kỹ thuật trọng tâm cho hiệp.",
  "Take a secure overhand grip and begin from a still active hang.":
    "Nắm úp chắc chắn và bắt đầu từ tư thế treo chủ động, không đung đưa.",
  "Take a secure palms-facing grip and begin from a quiet controlled hang.":
    "Nắm chắc với hai lòng bàn tay hướng vào nhau và bắt đầu từ tư thế treo yên, có kiểm soát.",
  "Take a shoulder-width underhand grip and begin from a controlled hang.":
    "Nắm ngửa rộng bằng vai và bắt đầu từ tư thế treo có kiểm soát.",
  "Take a stable push-up position with the ribs controlled and elbows comfortably angled.":
    "Vào tư thế chống đẩy vững chắc, kiểm soát xương sườn và để khuỷu tay ở góc thoải mái.",
  "Take a stable split stance": "Vào tư thế đứng chân trước chân sau vững chắc",
  "Take an overhand grip at about shoulder width.":
    "Nắm úp rộng khoảng bằng vai.",
  "Take one cable handle with the shoulders and hips square to the machine.":
    "Cầm một tay cầm cáp, giữ vai và hông hướng thẳng về máy.",
  "Take quiet, deliberate steps": "Bước nhẹ nhàng, có chủ ý",
  "Take rests whenever needed": "Nghỉ bất cứ khi nào cần",
  "Take small, soft bounces on the balls of the feet.":
    "Bật nhỏ, nhẹ trên phần trước bàn chân.",
  "Taking long unstable steps": "Bước dài thiếu ổn định",
  "Taking rushed or uneven steps": "Bước vội hoặc không đều",
  "Tensing the neck and shoulders": "Gồng căng cổ và vai",
  "Tensing the shoulders": "Gồng căng vai",
  "Test the bar and plates before starting":
    "Kiểm tra thanh đòn và bánh tạ trước khi bắt đầu",
  "Test the hooks and safety stops before the working set.":
    "Kiểm tra móc và chốt an toàn trước hiệp tập chính.",
  "Test the rack hooks and safeties before loading working weight.":
    "Kiểm tra móc giá đỡ và chốt an toàn trước khi lắp mức tạ tập chính.",
  "The flat-back requirement makes this one of the best anti-arch drills. If the back lifts, raise the legs higher or tuck the knees.":
    "Yêu cầu giữ lưng phẳng khiến đây là một trong những bài chống ưỡn lưng tốt nhất. Nếu lưng nhấc lên, hãy nâng chân cao hơn hoặc co gối lại.",
  "The heel pull and full exhale bring the pelvis and lower ribs toward a stacked position. Keep the movement gentle; this is a breathing and control drill, not a high bridge.":
    "Động tác kéo gót và thở ra hết đưa khung chậu cùng xương sườn dưới về vị trí thẳng hàng. Thực hiện nhẹ nhàng; đây là bài tập thở và kiểm soát, không phải nâng hông cao.",
  "The most common fault is flaring the ribs and arching the lower back. Keep ribs down and abs tight through the stretch.":
    "Lỗi phổ biến nhất là để xương sườn nhô lên và ưỡn lưng dưới. Giữ xương sườn hạ xuống và cơ bụng siết chặt trong suốt động tác giãn.",
  "The pelvic curl trains posterior tilt control, directly helping an arched-back posture. Keep ribs down.":
    "Động tác cuộn khung chậu rèn khả năng kiểm soát nghiêng khung chậu ra sau, trực tiếp hỗ trợ tư thế lưng ưỡn. Giữ xương sườn hạ xuống.",
  "The pelvic tuck, not a lower-back arch, creates the useful hip-flexor stretch. Stay tall only within the range where the ribs remain stacked.":
    "Cuộn khung chậu, chứ không phải ưỡn lưng dưới, mới tạo độ giãn cơ gập hông hiệu quả. Chỉ giữ người thẳng trong biên độ mà lồng ngực vẫn thẳng hàng với khung chậu.",
  "The torso should remain vertical with the ribs stacked over the pelvis. Reduce the load if you cannot resist side-bending in either direction.":
    "Thân người phải giữ thẳng đứng với lồng ngực thẳng hàng với khung chậu. Giảm mức tạ nếu bạn không thể chống nghiêng người sang hai bên.",
  "This is a light movement-control drill, not a structural correction. Keep it symptom-free and avoid pressing the head forcefully backward.":
    "Đây là bài kiểm soát chuyển động nhẹ, không phải cách chỉnh sửa cấu trúc cơ thể. Chỉ tập khi không có triệu chứng và tránh dùng lực mạnh ấn đầu ra sau.",
  "This is an anti-extension drill: keep the ribs down and pelvis lightly tucked. End the rollout as soon as the lower back starts to arch.":
    "Đây là bài chống duỗi cột sống: giữ xương sườn hạ xuống và khung chậu hơi cuộn. Kết thúc động tác lăn ngay khi lưng dưới bắt đầu ưỡn.",
  "This is the foundational drill for correcting an over-arched (anterior tilt) lower back. Learn the flatten-and-hold, then apply it during planks, presses and squats.":
    "Đây là bài nền tảng để chỉnh tư thế lưng dưới ưỡn quá mức (khung chậu nghiêng ra trước). Học cách ép phẳng và giữ, rồi áp dụng khi Plank, đẩy tạ và Squat.",
  "This is the plank tuned for arched-back correction: the glute squeeze drives a posterior tilt so the lower back stays flat. Ribs down, abs tight, glutes squeezed.":
    "Đây là biến thể Plank dành cho việc chỉnh lưng ưỡn: siết cơ mông tạo độ nghiêng khung chậu ra sau để lưng dưới giữ phẳng. Hạ xương sườn, siết cơ bụng và cơ mông.",
  "Throw punches by rotating through the hips and core.":
    "Ra đòn bằng cách xoay hông và cơ lõi.",
  "Tight hip flexors pull the pelvis into an arch. Squeezing the glute and tucking the pelvis is what opens the front of the hip — do not just lean forward and arch.":
    "Cơ gập hông căng kéo khung chậu vào tư thế ưỡn. Siết cơ mông và cuộn khung chậu mới mở được phần trước hông — đừng chỉ nghiêng người ra trước và ưỡn lưng.",
  "Tighten the abs and lats to pull the bar back to the start.":
    "Siết cơ bụng và cơ xô để kéo thanh đòn về vị trí ban đầu.",
  "Tilt with the abs, not by pushing the feet":
    "Dùng cơ bụng để nghiêng khung chậu, không đẩy bằng bàn chân",
  "Tip the pelvis back until the lower back rests softly on the mat.":
    "Nghiêng khung chậu ra sau đến khi lưng dưới nhẹ nhàng áp vào thảm.",
  "Touch the chest softly": "Chạm nhẹ vào ngực",
  "Touch the upper arm down softly": "Nhẹ nhàng chạm cánh tay trên xuống",
  "Touch the upper chest gently": "Chạm nhẹ vào ngực trên",
  "Track the front knee in line with the toes.":
    "Giữ đầu gối trước thẳng hàng với mũi chân.",
  "Track the front knee with the toes":
    "Giữ đầu gối trước đi theo hướng mũi chân",
  "Treat the walk as recovery": "Coi buổi đi bộ là hoạt động phục hồi",
  "Triceps pressdown with the elbows fixed at the sides":
    "Đẩy tay sau xuống với khuỷu tay cố định hai bên người",
  "Tuck the pelvis and squeeze the rear glute before moving upright.":
    "Cuộn khung chậu và siết cơ mông chân sau trước khi dựng người thẳng.",
  "Tuck the pelvis before moving upright":
    "Cuộn khung chậu trước khi dựng người thẳng",
  "Tuck the pelvis under (posterior tilt).":
    "Cuộn khung chậu xuống dưới (nghiêng ra sau).",
  "Tuck the ribs down and brace the core.":
    "Thu xương sườn xuống và siết cơ lõi.",
  "Tuck the ribs, chin slightly down": "Thu xương sườn, hơi hạ cằm",
  "Tucking the elbows toward the hips": "Khép khuỷu tay về phía hông",
  "Turn carefully while keeping the dumbbell close and still.":
    "Xoay người cẩn thận, giữ tạ đơn sát người và không để tạ đung đưa.",
  "Turn the rope with the wrists, not big arm swings.":
    "Quay dây bằng cổ tay, không vung tay biên độ lớn.",
  "Turn with the wrists": "Quay bằng cổ tay",
  "Turning a recovery swim into hard intervals":
    "Biến buổi bơi phục hồi thành các quãng tập nặng",
  "Turning it into a squat": "Biến động tác thành Squat",
  "Turning the feet outward": "Xoay bàn chân ra ngoài",
  "Twenty-to-forty-minute easy walk": "Đi bộ nhẹ từ hai mươi đến bốn mươi phút",
  "Twisting only from the reaching arm": "Chỉ vặn xoắn bằng cánh tay đang vươn",
  "Twisting the pelvis": "Vặn xoắn khung chậu",
  "Twisting the torso to lift heavier": "Vặn thân người để nâng tạ nặng hơn",
  "Two-arm dumbbell press": "Đẩy tạ đơn hai tay",
  "Two-leg calf raise": "Nhón bắp chân hai chân",
  "Underhand grip, drive the elbows down and back.":
    "Nắm ngửa, kéo khuỷu tay xuống và ra sau.",
  "Underhand grip, wrists neutral": "Nắm ngửa, giữ cổ tay trung tính",
  "Uneven time on each side": "Thời gian tập hai bên không đều",
  "Upper arms stay vertical": "Giữ cánh tay trên thẳng đứng",
  "Upper arms stay vertical, lower toward the forehead.":
    "Giữ cánh tay trên thẳng đứng, hạ tạ về phía trán.",
  "Upper arms swinging": "Cánh tay trên đung đưa",
  "Upper back on the bench, tuck the ribs, thrust to a flat hip.":
    "Tựa lưng trên lên ghế, thu xương sườn và đẩy hông đến khi duỗi thẳng.",
  "Upright couch stretch": "Giãn cơ gập hông tựa ghế với thân người thẳng",
  "Use a ball and wall rated for throwing and keep bystanders outside the rebound path.":
    "Dùng bóng và tường phù hợp để ném, đồng thời giữ người xung quanh ngoài đường bóng bật lại.",
  "Use a band and range that do not irritate the elbows or shoulders.":
    "Dùng dây và biên độ không gây khó chịu cho khuỷu tay hoặc vai.",
  "Use a comfortable wide stance": "Dùng tư thế đứng rộng thoải mái",
  "Use a consistent touch point": "Dùng một điểm chạm nhất quán",
  "Use a controlled calf stretch": "Kéo giãn bắp chân có kiểm soát",
  "Use a controlled range": "Dùng biên độ có kiểm soát",
  "Use a controlled stretch": "Kéo giãn có kiểm soát",
  "Use a firm whole-hand contact": "Giữ tiếp xúc chắc bằng toàn bộ bàn tay",
  "Use a full controlled range": "Dùng hết biên độ có kiểm soát",
  "Use a light controlled load": "Dùng mức tạ nhẹ, có kiểm soát",
  "Use a light load and row wide toward the upper ribs without shrugging.":
    "Dùng mức tạ nhẹ và kéo rộng về phía xương sườn trên mà không nhún vai.",
  "Use a light, controlled load": "Dùng mức tạ nhẹ, có kiểm soát",
  "Use a load that does not require leaning body weight onto the handle.":
    "Dùng mức tạ không khiến bạn phải dồn trọng lượng cơ thể lên tay cầm.",
  "Use a load that lets the neck and upper traps stay relaxed.":
    "Dùng mức tạ cho phép cổ và cơ thang trên được thả lỏng.",
  "Use a long complete exhale": "Thở ra dài và hết hoàn toàn",
  "Use a low non-slip elevation and stop before balance or pelvic control changes.":
    "Dùng bục kê thấp, chống trượt và dừng trước khi khả năng giữ thăng bằng hoặc kiểm soát khung chậu thay đổi.",
  "Use a modest bench angle": "Dùng góc ghế vừa phải",
  "Use a modest incline and lower the bar to the upper chest under control.":
    "Dùng độ dốc vừa phải và hạ thanh đòn về ngực trên có kiểm soát.",
  "Use a pain-free arc and keep the neck relaxed.":
    "Dùng cung chuyển động không đau và giữ cổ thả lỏng.",
  "Use a pain-free range and avoid kicking the pad with momentum.":
    "Dùng biên độ không đau và tránh đá đệm bằng đà.",
  "Use a relaxed natural stride": "Bước chân tự nhiên, thả lỏng",
  "Use a secure support": "Dùng điểm tựa chắc chắn",
  "Use a short light suitcase hold":
    "Giữ tạ một bên tại chỗ trong thời gian ngắn với mức tạ nhẹ",
  "Use a slight pelvic tuck": "Hơi cuộn khung chậu",
  "Use a slightly higher box only if landing mechanics stay identical":
    "Chỉ dùng bục cao hơn một chút nếu kỹ thuật tiếp đất vẫn y hệt",
  "Use a small controlled foot lift":
    "Nhấc chân nhẹ với biên độ nhỏ, có kiểm soát",
  "Use a small controlled range": "Dùng biên độ nhỏ, có kiểm soát",
  "Use a start position that does not force the shoulders too far behind the torso.":
    "Dùng vị trí bắt đầu không ép vai ra quá xa phía sau thân người.",
  "Use bodyweight or very light dumbbells":
    "Dùng trọng lượng cơ thể hoặc tạ đơn rất nhẹ",
  "Use easy to moderate effort only; no maximal effort, harness loading, or painful holds.":
    "Chỉ dùng mức gắng sức nhẹ đến vừa; không gắng sức tối đa, không đeo đai chịu tải hoặc giữ tư thế gây đau.",
  "Use equal controllable loads": "Dùng mức tạ bằng nhau và kiểm soát được",
  "Use equal time on both sides": "Dành thời gian bằng nhau cho hai bên",
  "Use full ankle range, pause at the top, and lower slowly.":
    "Dùng hết biên độ cổ chân, dừng ở vị trí trên cùng rồi từ từ hạ xuống.",
  "Use full range": "Dùng hết biên độ",
  "Use generous padding under the knee": "Lót đệm dày dưới đầu gối",
  "Use incline instead of running": "Dùng độ dốc thay vì chạy",
  "Use incline instead of running to spare the shins.":
    "Dùng độ dốc thay vì chạy để giảm tải cho ống chân.",
  "Use light resistance; this recovery drill should not create fatigue.":
    "Dùng lực kháng nhẹ; bài phục hồi này không được gây mệt mỏi.",
  "Use light tension that allows normal breathing and a level pelvis.":
    "Dùng lực căng nhẹ cho phép thở bình thường và giữ khung chậu ngang bằng.",
  "Use only pain-free depth": "Chỉ xuống độ sâu không đau",
  "Use only symptom-free range and keep the ribs stacked over the pelvis.":
    "Chỉ dùng biên độ không gây triệu chứng và giữ lồng ngực thẳng hàng với khung chậu.",
  "Use only the depth where the feet, knees, and pelvis stay controlled.":
    "Chỉ xuống độ sâu mà bàn chân, đầu gối và khung chậu vẫn ổn định.",
  "Use only the range that does not cause pinching or lower-back arching.":
    "Chỉ dùng biên độ không gây cảm giác kẹt hoặc ưỡn lưng dưới.",
  "Use only when the knees and ankles feel good; stop as soon as jump quality drops.":
    "Chỉ tập khi đầu gối và cổ chân cảm thấy ổn; dừng ngay khi chất lượng bật nhảy giảm.",
  "Use safeties and never place the feet so low that they can slide off the platform.":
    "Dùng chốt an toàn và không bao giờ đặt chân thấp đến mức có thể trượt khỏi bàn đạp.",
  "Use smooth strokes and an easy pace with relaxed breathing.":
    "Bơi với động tác nhịp nhàng, nhịp độ nhẹ và hít thở thư giãn.",
  "Use smooth unhurried strokes": "Bơi với động tác nhịp nhàng, không vội",
  "Use stable supports and lower between the hands only as far as controlled.":
    "Dùng điểm kê vững chắc và chỉ hạ người giữa hai tay đến mức kiểm soát được.",
  "Use support if balance is limiting":
    "Dùng điểm tựa nếu khả năng thăng bằng là yếu tố giới hạn",
  "Use the lower abs and a light glute squeeze.":
    "Dùng cơ bụng dưới và siết nhẹ cơ mông.",
  "Use the safety stops and a depth that remains comfortable for knees and hips.":
    "Dùng chốt an toàn và chọn độ sâu vẫn thoải mái cho đầu gối và hông.",
  "Use very light effort and stop for dizziness, radiating symptoms, or neck pain.":
    "Chỉ gắng sức rất nhẹ và dừng nếu chóng mặt, có triệu chứng lan tỏa hoặc đau cổ.",
  "Using a load that changes the movement": "Dùng mức tạ làm thay đổi động tác",
  "Using a load that prevents control":
    "Dùng mức tạ khiến bạn không thể kiểm soát",
  "Using a load that shortens posture": "Dùng mức tạ khiến tư thế bị co rút",
  "Using a load that shortens the range": "Dùng mức tạ làm rút ngắn biên độ",
  "Using a loose grip on the dumbbell": "Nắm tạ đơn lỏng lẻo",
  "Using a range the shoulder cannot control":
    "Dùng biên độ mà vai không thể kiểm soát",
  "Using a step that is too short": "Bước chân quá ngắn",
  "Using a surface that is too high or unstable":
    "Dùng bề mặt quá cao hoặc thiếu ổn định",
  "Using an unstable heel support": "Dùng điểm kê gót thiếu ổn định",
  "Using leg bounce for momentum": "Nhún chân để lấy đà",
  "Using momentum": "Dùng đà",
  "Using momentum at the bottom": "Dùng đà ở vị trí dưới cùng",
  "Using momentum instead of ankle motion":
    "Dùng đà thay vì chuyển động cổ chân",
  "Using momentum instead of the biceps": "Dùng đà thay vì cơ tay trước",
  "Using more range than the hamstrings can control":
    "Dùng biên độ lớn hơn mức cơ đùi sau có thể kiểm soát",
  "Using partial range of motion": "Dùng biên độ chuyển động một phần",
  "Using the biceps or traps instead of rear delts":
    "Dùng cơ tay trước hoặc cơ thang thay vì vai sau",
  "Using too much force": "Dùng quá nhiều lực",
  "Using unsecured or non-rolling plates":
    "Dùng bánh tạ không được cố định hoặc không lăn được",
  "Using unstable or rolling supports":
    "Dùng điểm kê thiếu ổn định hoặc bị lăn",
  "Using weight that forces momentum": "Dùng mức tạ buộc phải lấy đà",
  "VR boxing stance with guard up": "Tư thế boxing VR với hai tay giữ thế thủ",
  "Walk 25-35 minutes, avoiding a hard run.":
    "Đi bộ 25–35 phút, tránh chạy gắng sức.",
  "Walk tall and resist leaning toward or away from the load.":
    "Đi thẳng người và chống nghiêng về phía tạ hoặc ra xa tạ.",
  "Walk tall with ribs down and a neutral spine. Do not hang on the handrails, which rounds the posture.":
    "Đi thẳng người với xương sườn hạ xuống và cột sống trung tính. Không bám treo người lên tay vịn vì sẽ làm tư thế bị gù.",
  "Walk tall with the shoulders loose and arms swinging naturally.":
    "Đi thẳng người với vai thả lỏng và tay đánh tự nhiên.",
  "Walk tall without forcing a rigid posture. Keep the ribs comfortably over the pelvis and avoid looking down at a phone for long periods.":
    "Đi thẳng người mà không gượng ép tư thế cứng nhắc. Giữ lồng ngực thẳng hàng tự nhiên với khung chậu và tránh cúi nhìn điện thoại trong thời gian dài.",
  "Walk tall without swaying": "Đi thẳng người mà không lắc lư",
  "Walk with short controlled steps without leaning or swaying.":
    "Bước ngắn có kiểm soát mà không nghiêng hoặc lắc người.",
  "Walking hard enough to add fatigue":
    "Đi bộ với cường độ cao đến mức làm tăng mệt mỏi",
  "Walking tall on an inclined treadmill":
    "Đi thẳng người trên máy chạy bộ dốc",
  "Walking when complete rest is needed": "Đi bộ khi cơ thể cần nghỉ hoàn toàn",
  "Wall bridge": "Nâng hông tựa tường",
  "Wall handstand push-up": "Chống đẩy trồng chuối tựa tường",
  "Wall slide": "Trượt tay trên tường",
  "Wall tibialis raise close to the wall":
    "Nâng mũi chân tựa tường khi đứng gần tường",
  "Wall tibialis raise with feet farther forward":
    "Nâng mũi chân tựa tường với bàn chân đặt xa hơn về trước",
  "Wall/box pike hold": "Giữ tư thế chữ V tựa tường/bục",
  "Wear a secure backpack or add a dip belt.":
    "Đeo ba lô chắc chắn hoặc dùng đai treo tạ.",
  "Weighted calf raise": "Nhón bắp chân có tạ",
  "Weighted chin-up": "Hít xà tay ngửa có tạ",
  "Weighted chin-up with pause": "Hít xà tay ngửa có tạ và dừng",
  "Weighted close-grip push-up": "Chống đẩy tay hẹp có tạ",
  "Weighted dead bug": "Dead Bug có tạ",
  "Weighted deficit push-up": "Chống đẩy hạ sâu có tạ",
  "Weighted diamond push-up": "Chống đẩy kim cương có tạ",
  "Weighted dip (backpack)": "Xà kép có tạ (ba lô)",
  "Weighted glute bridge": "Nâng hông nằm có tạ",
  "Weighted hip thrust": "Đẩy hông có tạ",
  "Weighted inverted row": "Kéo xà thấp có tạ",
  "Weighted plank (backpack)": "Plank có tạ (ba lô)",
  "Weighted plank + glute squeeze": "Plank có tạ + siết cơ mông",
  "Weighted pull-up (light backpack)": "Hít xà có tạ (ba lô nhẹ)",
  "Weighted pull-up with a backpack or dip belt":
    "Hít xà có tạ bằng ba lô hoặc đai treo tạ",
  "Weighted pull-up with pause": "Hít xà có tạ và dừng",
  "Weighted push-up": "Chống đẩy có tạ",
  "Weighted side plank": "Plank nghiêng có tạ",
  "Work in short rounds and build up over time.":
    "Tập theo các hiệp ngắn và tăng dần theo thời gian.",
  "Work in short rounds and keep the movement smooth.":
    "Tập theo các hiệp ngắn và giữ chuyển động mượt.",
  "Wrap the hands, wear appropriate gloves, and begin at a balanced distance from the bag.":
    "Quấn tay, đeo găng phù hợp và bắt đầu ở khoảng cách hợp lý với bao cát.",
  "Wrist strain from a rushed setup": "Căng cổ tay do vào tư thế quá vội",
  "Wrists stacked over elbows": "Cổ tay thẳng hàng trên khuỷu tay",
  "Y-raise with a longer pause": "Nâng tay chữ Y với thời gian dừng lâu hơn",
  "Yanking the bar with the lower back": "Giật thanh đòn bằng lưng dưới",
  "Yanking the dumbbells with momentum": "Giật tạ đơn bằng đà",
  "Yanking the neck": "Giật cổ",
  "Yanking with the biceps only": "Chỉ giật kéo bằng cơ tay trước",
};
