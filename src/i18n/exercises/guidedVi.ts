/**
 * Vietnamese wording for the guided workouts, keyed by the exact English text.
 *
 * Guided workouts carry plain English strings in their data files so a new
 * session can be written without touching a message catalog (see
 * `guidedWorkouts.ts`). They are translated the same way the exercise library
 * is: by exact phrase, with anything unrecognised passing through as written.
 * That is what lets a workout added later still render, in English, until its
 * wording is added here.
 *
 * As in [[vi.ts]], a movement keeps the English term in brackets where that is
 * what a gym in Vietnam actually says.
 */
export const guidedPhrasesVi: Record<string, string> = {
  // ------------------------------------------------------------- categories
  'Cardio / HIIT': 'Cardio / HIIT',
  'Short bursts of work with timed rest. Gets the heart rate up fast.':
    'Tập dồn dập từng đợt ngắn, xen kẽ nghỉ có tính giờ. Đẩy nhịp tim lên rất nhanh.',
  Abs: 'Cơ bụng',
  'Core circuits held for time, floor-based and equipment free.':
    'Chuỗi bài cơ trung tâm tính theo thời gian, tập dưới sàn và không cần dụng cụ.',
  'Posture Correction': 'Chỉnh tư thế',
  'Undo a day at a desk: upper back, neck and hip position.':
    'Gỡ lại một ngày ngồi bàn: lưng trên, cổ và tư thế hông.',
  'Mobility / Stretching': 'Vận động / Giãn cơ',
  'Longer holds for range of motion, warm-ups and cool-downs.':
    'Giữ lâu hơn để tăng biên độ, dùng để khởi động và thả lỏng.',

  // --------------------------------------------------------------- workouts
  'Classic HIIT': 'HIIT cơ bản',
  'The standard thirty-on, ten-off circuit through five bodyweight movements.':
    'Chuỗi ba mươi giây tập, mười giây nghỉ qua năm động tác không dụng cụ.',
  'Express Burner': 'Đốt mỡ cấp tốc',
  'Eight hard minutes when that is all the time there is.':
    'Tám phút nặng đô khi bạn chỉ có chừng đó thời gian.',
  'No-Jump Cardio': 'Cardio không nhảy',
  'The same work with one foot always on the floor - easy on knees and on neighbours.':
    'Cường độ tương đương nhưng luôn có một chân chạm sàn - nhẹ cho đầu gối và cho hàng xóm.',
  'First Cardio Session': 'Buổi cardio đầu tiên',
  'Six minutes, generous rest, nothing that needs coordination.':
    'Sáu phút, nghỉ thoải mái, không có động tác nào đòi hỏi phối hợp phức tạp.',
  'Core Basics': 'Cơ bụng căn bản',
  'Four movements that teach the shape everything else needs.':
    'Bốn động tác dạy bạn tư thế mà mọi bài còn lại đều cần.',
  'Ab Burner': 'Đốt cơ bụng',
  'Six movements, three rounds, ten seconds between each.':
    'Sáu động tác, ba vòng, nghỉ mười giây giữa mỗi động tác.',
  'Plank Challenge': 'Thử thách Plank',
  'Every plank there is, held back to back.':
    'Tất cả các kiểu plank, giữ liên tiếp nhau.',
  'Standing Abs': 'Cơ bụng đứng',
  'Core work with no floor needed - good for a hotel room or an office.':
    'Tập cơ trung tâm mà không cần nằm sàn - hợp với phòng khách sạn hoặc văn phòng.',
  'Desk Reset': 'Giải toả sau bàn làm việc',
  'Six minutes to undo a morning hunched over a laptop.':
    'Sáu phút để gỡ lại một buổi sáng gù lưng trước máy tính.',
  'Upper Back Strength': 'Khoẻ lưng trên',
  'The pulling and lifting work that holds a straight posture up once it is stretched.':
    'Các bài kéo và nâng giúp giữ tư thế thẳng sau khi đã giãn cơ.',
  'Posture Foundation': 'Nền tảng tư thế',
  'Rib position, hip position, and holding both while you move.':
    'Vị trí lồng ngực, vị trí hông, và giữ được cả hai khi chuyển động.',
  'Full Body Stretch': 'Giãn cơ toàn thân',
  'Head to heel, forty-five seconds a hold, one time through.':
    'Từ đầu tới gót, mỗi tư thế giữ bốn mươi lăm giây, chạy một lượt.',
  'Morning Mobility': 'Vận động buổi sáng',
  'Moving stretches to start the day, nothing held for long.':
    'Các động tác giãn cơ động để mở đầu ngày mới, không giữ lâu ở tư thế nào.',
  'Hips And Lower Back': 'Hông và lưng dưới',
  'For hips that have been folded into a chair all day.':
    'Dành cho phần hông đã gập trong ghế suốt cả ngày.',
  'Wind Down': 'Thả lỏng',
  'Five easy floor holds to finish a session or a day.':
    'Năm tư thế nằm sàn nhẹ nhàng để kết thúc buổi tập hoặc một ngày.',

  // ------------------------------------------------------------ focus tags
  Conditioning: 'Thể lực',
  'Cool-down': 'Thả lỏng',
  Core: 'Cơ trung tâm',
  Endurance: 'Sức bền',
  'Fat loss': 'Giảm mỡ',
  Flexibility: 'Độ dẻo',
  'Full body': 'Toàn thân',
  Hips: 'Hông',
  Isometric: 'Giữ tĩnh',
  'Low impact': 'Ít va chạm',
  'Lower back': 'Lưng dưới',
  Neck: 'Cổ',
  'No floor': 'Không cần nằm sàn',
  Relaxation: 'Thư giãn',
  Shoulders: 'Vai',
  Starter: 'Khởi đầu',
  Technique: 'Kỹ thuật',
  'Upper back': 'Lưng trên',
  'Warm-up': 'Khởi động',

  // --------------------------------------------------------- movement names
  //
  // Movements the strength library already names - Plank, Side Plank, Dead Bug,
  // Reverse Crunch, Lying Leg Raise, Chin Tuck - are deliberately absent: they
  // are translated once in `vi.ts`, which is merged ahead of this map.
  'Jumping Jacks': 'Nhảy dang tay chân (Jumping Jack)',
  'High Knees': 'Chạy nâng cao đùi',
  'Mountain Climbers': 'Leo núi tại chỗ (Mountain Climber)',
  Burpees: 'Burpee',
  'Slow Burpees': 'Burpee chậm',
  'Squat Jumps': 'Squat bật nhảy',
  'Skater Hops': 'Bật ngang kiểu trượt băng',
  'Plank Jacks': 'Plank bật tách chân',
  'Jump Rope': 'Nhảy dây',
  'Criss-Cross Jacks': 'Nhảy bắt chéo tay chân',
  'Step Jacks': 'Bước dang tay chân (không nhảy)',
  'Marching On The Spot': 'Giậm chân tại chỗ',
  'Alternating Ankle Touches': 'Nghiêng người chạm cổ chân luân phiên',
  'Front Kicks': 'Đá thẳng trước',
  'Wall Sit': 'Tựa tường giữ tư thế ngồi',
  'Bodyweight Squats': 'Squat không tạ',
  'Lunge With Twist': 'Lunge kết hợp xoay người',
  Crunch: 'Gập bụng (Crunch)',
  'Bicycle Crunch': 'Gập bụng đạp xe',
  'Flutter Kicks': 'Đạp chân luân phiên',
  'Russian Twist': 'Xoay người kiểu Nga (Russian Twist)',
  'Hollow Hold': 'Giữ tư thế lòng thuyền (Hollow Hold)',
  'Heel Touches': 'Chạm gót',
  'Oblique Crunch': 'Gập bụng chéo',
  'Plank Hip Raise': 'Plank đẩy hông lên',
  'Reverse Plank': 'Plank ngửa',
  'Standing Torso Rotation': 'Đứng xoay thân',
  'Bird Dog': 'Bird Dog',
  Superman: 'Superman',
  'Prone W Raise': 'Nằm sấp nâng tay chữ W',
  'Band Reverse Fly': 'Kéo dây tách tay ra sau',
  'Face Pull': 'Kéo dây về phía mặt (Face Pull)',
  'Wall Shoulder Walks': 'Đi tay lên tường',
  'Wall Push-Up': 'Chống đẩy vào tường',
  'Bodyweight Good Morning': 'Gập hông kiểu Good Morning không tạ',
  'Back Slaps And Wrap': 'Vung tay mở ngực và ôm vai',
  'Elbows Back Stretch': 'Giãn ngực bằng cách kéo khuỷu tay ra sau',
  'Standing Reach And Rotate': 'Đứng vươn tay và xoay lưng trên',
  'Overhead Chest Stretch': 'Giãn ngực với tay sau đầu',
  'Cat-Cow': 'Tư thế mèo - bò (Cat-Cow)',
  'Cobra Stretch': 'Giãn lưng tư thế rắn hổ mang',
  'Downward Dog': 'Tư thế chó úp mặt',
  'Low Lunge': 'Lunge thấp',
  'Deep Lunge Stretch': 'Giãn hông tư thế lunge sâu',
  'Kneeling Hip Flexor Stretch': 'Quỳ giãn cơ gấp hông',
  'Butterfly Stretch': 'Giãn háng tư thế con bướm',
  'Lying Hamstring Stretch': 'Nằm giãn cơ đùi sau',
  'Standing Hamstring Stretch': 'Đứng giãn cơ đùi sau',
  'Standing Quad Stretch': 'Đứng giãn cơ đùi trước',
  'Seated Calf Stretch': 'Ngồi giãn bắp chân',
  'Kneeling Lat Stretch': 'Quỳ giãn cơ lưng xô',
  'Cross-Body Shoulder Stretch': 'Giãn vai bằng cách kéo tay ngang ngực',
  'Side Neck Stretch': 'Giãn cơ cổ sang bên',
  'Dynamic Chest Stretch': 'Giãn ngực động',
  'Dynamic Back Stretch': 'Giãn lưng động',

  // -------------------------------------------------------- coaching lines
  'Land soft, arms all the way overhead.':
    'Tiếp đất nhẹ, tay vung hết lên trên đầu.',
  'Knees to hip height, stay on the balls of your feet.':
    'Nâng gối ngang hông, luôn tiếp đất bằng nửa bàn chân trước.',
  'Hips low, shoulders stacked over your hands.':
    'Hông thấp, vai thẳng hàng trên bàn tay.',
  'Chest to the floor, then jump and reach.':
    'Ngực chạm sàn, rồi bật lên và vươn tay.',
  'Same shape as a burpee, walked instead of jumped.':
    'Cùng động tác như burpee nhưng bước chân thay vì bật nhảy.',
  'Sit back, explode up, land quietly.':
    'Hạ hông ra sau, bật lên dứt khoát, tiếp đất êm.',
  'Bound side to side and stick each landing.':
    'Bật ngang qua lại và giữ vững mỗi lần tiếp đất.',
  'Plank on top, jumping feet underneath.':
    'Giữ plank ở phần trên, chỉ có chân bật ra vào.',
  'Small hops, wrists doing the turning.':
    'Bật nhẹ, quay dây bằng cổ tay.',
  'Cross the arms and feet, then open wide.':
    'Bắt chéo tay và chân, rồi mở rộng ra.',
  'A jumping jack with one foot always down.':
    'Như jumping jack nhưng luôn có một chân chạm đất.',
  'Tall posture, knees up, arms swinging.':
    'Lưng thẳng, nâng gối, tay đánh nhịp nhàng.',
  'Hinge side to side and reach for the ankle.':
    'Nghiêng người sang hai bên và với xuống cổ chân.',
  'Kick from the hip, guard up.': 'Đá ra từ hông, tay giữ ở tư thế phòng thủ.',
  'Thighs parallel, back flat against the wall.':
    'Đùi song song mặt sàn, lưng áp phẳng vào tường.',
  'Sit back between your heels, chest tall.':
    'Hạ hông xuống giữa hai gót, ngực vẫn ngẩng cao.',
  'Long step, then rotate over the front leg.':
    'Bước dài, rồi xoay người về phía chân trước.',
  'Ribs towards hips - the lower back stays down.':
    'Kéo lồng ngực về phía hông - lưng dưới luôn áp sàn.',
  'Opposite elbow towards opposite knee, slowly.':
    'Khuỷu tay bên này hướng về gối bên kia, làm chậm.',
  'Roll the hips up, do not swing the legs.':
    'Cuộn hông lên, đừng lấy đà bằng chân.',
  'One straight line from your head to your heels.':
    'Một đường thẳng từ đầu tới gót chân.',
  'Hips high, shoulder stacked over the elbow.':
    'Hông nâng cao, vai thẳng hàng trên khuỷu tay.',
  'Lower only as far as your back stays flat.':
    'Chỉ hạ chân tới mức lưng còn áp sàn.',
  'Small, fast kicks with the lower back pinned down.':
    'Đạp chân ngắn và nhanh, lưng dưới luôn ghim xuống sàn.',
  'Rotate from the ribs, chest stays lifted.':
    'Xoay từ lồng ngực, ngực vẫn mở.',
  'Lower back glued to the floor throughout.':
    'Lưng dưới dán chặt xuống sàn suốt bài.',
  'Press the lower back down and hold the dish shape.':
    'Ép lưng dưới xuống và giữ hình lòng thuyền.',
  'Crunch to the side and tap your heel.':
    'Gập người sang bên và chạm gót chân.',
  'Drive the elbow towards the opposite hip.':
    'Đẩy khuỷu tay về phía hông bên đối diện.',
  'From a forearm plank, pike the hips up and back.':
    'Từ tư thế plank khuỷu tay, đẩy hông lên và ra sau.',
  'Chest open, hips lifted, eyes forward.':
    'Mở ngực, nâng hông, mắt nhìn thẳng.',
  'Turn from the waist, hips facing forward.':
    'Xoay từ eo, hông vẫn hướng về trước.',
  'Opposite arm and leg, no wobble through the hips.':
    'Tay và chân đối diện, hông không lắc.',
  'Lift the chest and thighs, look at the floor.':
    'Nâng ngực và đùi lên, mắt nhìn xuống sàn.',
  'Pull the shoulder blades down and together.':
    'Kéo hai bả vai xuống và ép lại gần nhau.',
  'Open the arms wide, thumbs leading.':
    'Mở rộng hai tay, ngón cái dẫn hướng.',
  'Pull to your forehead, elbows high.':
    'Kéo về phía trán, khuỷu tay giữ cao.',
  'Ribs down - do not arch to reach higher.':
    'Hạ lồng ngực xuống - đừng ưỡn lưng để với cao hơn.',
  'Push the floor away and let the shoulder blades spread.':
    'Đẩy mạnh vào tường và để hai bả vai giãn ra.',
  'Hinge at the hips with a flat back.': 'Gập ở khớp hông, lưng giữ phẳng.',
  'Slide the head back over your shoulders.':
    'Đẩy đầu lùi lại cho thẳng hàng với vai.',
  'Swing the arms open, then wrap them around you.':
    'Vung hai tay mở rộng, rồi ôm vòng quanh người.',
  'Chest open, shoulders rolling back and down.':
    'Mở ngực, vai xoay ra sau và xuống dưới.',
  'Reach tall, then turn and open the chest.':
    'Vươn cao, rồi xoay người và mở ngực.',
  'Hands behind the head, elbows back.':
    'Hai tay sau đầu, khuỷu tay kéo ra sau.',
  'Round on the way out, arch on the way in.':
    'Cong lưng lên khi thở ra, võng lưng xuống khi hít vào.',
  'Long through the front, shoulders away from your ears.':
    'Kéo dài phần thân trước, vai hạ xa khỏi tai.',
  'Hips high, heels reaching for the floor.':
    'Hông đẩy cao, gót chân với xuống sàn.',
  'Sink the hips forward and stay tall.':
    'Đẩy hông về trước và giữ thân người thẳng.',
  'Drop the hips and let the chest stay lifted.':
    'Hạ hông xuống và giữ ngực ngẩng cao.',
  'Tuck the tailbone under before you lean.':
    'Cuộn xương cụt xuống trước khi đẩy người tới.',
  'Soles together, chest tall, knees easing down.':
    'Hai lòng bàn chân áp nhau, ngực thẳng, gối từ từ hạ xuống.',
  'Straight leg up, the other one pressed down.':
    'Một chân duỗi thẳng đưa lên, chân kia ép sát sàn.',
  'Hinge from the hips, back stays long.':
    'Gập từ khớp hông, lưng giữ dài và thẳng.',
  'Knees together, hips tucked under.':
    'Hai gối sát nhau, hông cuộn xuống dưới.',
  'Pull the toes towards you, knee straight.':
    'Kéo mũi bàn chân về phía mình, gối duỗi thẳng.',
  'Hips back, armpits sinking towards the floor.':
    'Hông đẩy ra sau, nách hạ dần xuống sàn.',
  'Arm across the chest, shoulder pulled down.':
    'Tay vắt ngang ngực, vai kéo xuống.',
  'Ear towards the shoulder, no shrugging.':
    'Nghiêng tai về phía vai, không nhún vai lên.',
  'Open the arms wide and pulse gently.':
    'Mở rộng hai tay và nhịp nhẹ nhàng.',
  'Round forward, then open wide.':
    'Cuộn người về trước, rồi mở rộng ra.',

  // ------------------------------------------------------ spoken mid-cues
  'Arms all the way up. Stay light on your feet.':
    'Tay vươn hết lên. Chân giữ nhẹ nhàng.',
  'Higher knees. Drive the arms.': 'Nâng gối cao hơn. Đánh tay mạnh lên.',
  'Keep the hips down. Quick feet.': 'Giữ hông thấp. Chân đảo nhanh.',
  'Pace it. Full stand at the top of every rep.':
    'Giữ nhịp đều. Mỗi lần đều đứng thẳng hẳn lên.',
  'Soft landings. Knees tracking over your toes.':
    'Tiếp đất êm. Gối hướng theo mũi chân.',
  'Keep breathing. Weight in your heels.': 'Thở đều. Dồn trọng lượng vào gót.',
  'Chin off your chest. Squeeze at the top.':
    'Cằm không ép vào ngực. Siết bụng ở điểm cao nhất.',
  'Hips level. Keep breathing.': 'Giữ hông ngang bằng. Thở đều.',
  'Press your lower back into the floor.': 'Ép lưng dưới xuống sàn.',
  'Slow it down. Keep your hips square to the floor.':
    'Làm chậm lại. Giữ hông vuông góc với sàn.',
  'Tuck your tailbone. Do not arch your lower back.':
    'Cuộn xương cụt xuống. Đừng ưỡn lưng dưới.',

  // --------------------------------------------------------- how-to lines
  'Jump the feet wide and sweep both arms above your head.':
    'Bật hai chân rộng ra và vung cả hai tay lên quá đầu.',
  'Jump them back together and keep a steady, springy rhythm.':
    'Bật khép chân lại và giữ nhịp nảy đều đặn.',
  'Drive one knee up to hip height, then quickly swap.':
    'Nâng một gối lên ngang hông, rồi đổi chân thật nhanh.',
  'Stay tall, pump the arms, and keep the contact with the floor short.':
    'Giữ thân người thẳng, đánh tay, và chạm sàn thật ngắn.',
  'Start in a push-up position with your hands under your shoulders.':
    'Bắt đầu ở tư thế chống đẩy, hai tay đặt dưới vai.',
  'Drive the knees to your chest one at a time without letting the hips rise.':
    'Kéo lần lượt từng gối về phía ngực mà không để hông nhô lên.',
  'Squat down, plant your hands, and shoot the feet back to a plank.':
    'Hạ người xuống squat, chống hai tay, rồi đạp chân ra sau thành plank.',
  'Jump the feet back in, stand, and finish with a jump and a reach overhead.':
    'Bật chân về, đứng lên, và kết thúc bằng một cú bật nhảy vươn tay lên cao.',
  'Squat down, plant the hands, and step the feet back one at a time.':
    'Hạ người xuống squat, chống hai tay, rồi bước từng chân ra sau.',
  'Step them back in and stand tall - no jump at either end.':
    'Bước từng chân về và đứng thẳng lên - không bật nhảy ở cả hai đầu.',
  'Drop into a squat with your chest up and your weight through mid-foot.':
    'Hạ xuống squat với ngực ngẩng và trọng lượng dồn vào giữa bàn chân.',
  'Drive up into a jump and absorb the landing straight back into the next squat.':
    'Bật mạnh lên và hạ xuống êm, tiếp luôn vào lần squat kế tiếp.',
  'Push off one leg and bound sideways onto the other.':
    'Đạp một chân và bật ngang sang chân kia.',
  'Let the trailing leg swing behind you and hold the landing for a beat.':
    'Để chân sau vắt chéo ra phía sau và giữ vững tư thế một nhịp.',
  'Hold a strong plank with your shoulders over your hands.':
    'Giữ plank chắc chắn với vai thẳng hàng trên bàn tay.',
  'Jump the feet wide and back together without letting the hips bounce.':
    'Bật hai chân rộng ra rồi khép lại mà không để hông nhấp nhô.',
  'Turn the rope from the wrists, elbows tucked in near your ribs.':
    'Quay dây bằng cổ tay, khuỷu tay khép sát sườn.',
  'Keep the jumps low - just enough to clear the rope.':
    'Bật thấp thôi - vừa đủ để dây đi qua.',
  'Jump the feet apart and swing the arms out to the sides.':
    'Bật tách hai chân và vung hai tay sang ngang.',
  'Jump them back crossing one foot and one arm over the other, alternating each rep.':
    'Bật về khép lại, bắt chéo một chân và một tay, đổi bên mỗi lần.',
  'Step one foot out to the side and sweep both arms overhead.':
    'Bước một chân sang bên và vung cả hai tay lên quá đầu.',
  'Step it back in and repeat on the other side, keeping the rhythm going.':
    'Bước chân về và lặp lại với bên kia, giữ nhịp liên tục.',
  'March on the spot lifting each knee to hip height.':
    'Giậm chân tại chỗ, nâng từng gối lên ngang hông.',
  'Swing the opposite arm with every step and breathe steadily.':
    'Đánh tay đối diện theo mỗi bước và thở đều.',
  'Stand with your feet wide and bend to one side, reaching for that ankle.':
    'Đứng hai chân rộng, nghiêng sang một bên và với xuống cổ chân bên đó.',
  'Come back up and repeat on the other side at a steady pace.':
    'Đứng thẳng lên và lặp lại với bên kia theo nhịp đều.',
  'Keep your hands up and drive one foot forward at hip height.':
    'Giữ hai tay lên cao và đá một chân ra trước ngang hông.',
  'Bring it straight back under you and swap sides.':
    'Thu chân về ngay dưới thân người rồi đổi bên.',
  'Slide down a wall until your knees are bent to a right angle.':
    'Trượt lưng xuống dọc tường tới khi gối gập vuông góc.',
  'Press your lower back into the wall and breathe - nothing moves.':
    'Ép lưng dưới vào tường và thở đều - không cử động gì thêm.',
  'Feet about shoulder width, toes turned slightly out.':
    'Hai chân rộng bằng vai, mũi chân hơi xoay ra ngoài.',
  'Sit back and down as far as you can hold a flat back, then stand and squeeze.':
    'Hạ hông xuống sâu nhất mà lưng còn giữ phẳng, rồi đứng lên và siết mông.',
  'Step forward into a lunge until both knees are bent to a right angle.':
    'Bước tới thành tư thế lunge cho tới khi cả hai gối gập vuông góc.',
  'Rotate your torso towards the front leg, come back to centre and push up.':
    'Xoay thân về phía chân trước, quay lại giữa rồi đạp lên.',
  'Lie on your back with your knees bent and your hands by your ears.':
    'Nằm ngửa, gối gập, hai tay đặt cạnh tai.',
  'Curl your shoulders off the floor, pause at the top, and lower with control.':
    'Cuộn vai lên khỏi sàn, dừng ở điểm cao nhất, rồi hạ xuống có kiểm soát.',
  'Lie back, lift both feet, and bring one knee in as the other leg extends.':
    'Nằm ngửa, nhấc hai chân lên, kéo một gối vào trong khi chân kia duỗi ra.',
  'Rotate your chest - not just your elbow - towards the bent knee, and alternate.':
    'Xoay cả phần ngực - không chỉ khuỷu tay - về phía gối đang co, rồi đổi bên.',
  'Lie on your back with your knees bent over your hips and arms by your sides.':
    'Nằm ngửa, gối gập ở phía trên hông, hai tay xuôi theo thân.',
  'Curl your hips off the floor towards your ribs, then lower slowly.':
    'Cuộn hông lên khỏi sàn về phía lồng ngực, rồi hạ xuống từ từ.',
  'Elbows under your shoulders, forearms flat on the floor.':
    'Khuỷu tay dưới vai, cẳng tay áp phẳng xuống sàn.',
  'Squeeze your glutes and abs so your hips neither sag nor pike up.':
    'Siết mông và bụng để hông không võng xuống cũng không nhô lên.',
  'Lie on your side and prop yourself on one forearm, feet stacked.':
    'Nằm nghiêng và chống lên một cẳng tay, hai bàn chân xếp chồng.',
  'Lift your hips until your body is a straight line and hold.':
    'Nâng hông lên tới khi thân người thành một đường thẳng rồi giữ.',
  'Lie flat with your hands under your hips and your legs straight.':
    'Nằm ngửa, hai tay đặt dưới hông, hai chân duỗi thẳng.',
  'Raise both legs to vertical, then lower them slowly without arching.':
    'Nâng hai chân lên vuông góc, rồi hạ xuống chậm mà không ưỡn lưng.',
  'Lie on your back with your legs straight and lifted just off the floor.':
    'Nằm ngửa, hai chân duỗi thẳng và nhấc nhẹ khỏi sàn.',
  'Kick them past each other in a short, quick scissor.':
    'Đạp hai chân qua nhau theo nhịp kéo ngắn và nhanh.',
  'Sit back at about forty-five degrees with your feet off the floor.':
    'Ngả người ra sau khoảng bốn mươi lăm độ, hai chân nhấc khỏi sàn.',
  'Rotate your torso from side to side, touching the floor beside each hip.':
    'Xoay thân qua lại, chạm sàn ở hai bên hông.',
  'Lie back with your arms up and your knees over your hips.':
    'Nằm ngửa, hai tay đưa lên và gối ở phía trên hông.',
  'Lower one arm and the opposite leg, breathe out, and return. Alternate sides.':
    'Hạ một tay và chân đối diện, thở ra, rồi thu về. Đổi bên luân phiên.',
  'Lie on your back and lift your shoulders, arms and legs off the floor.':
    'Nằm ngửa và nhấc vai, tay và chân lên khỏi sàn.',
  'Keep the lower back pressed flat - drop the legs higher if it lifts.':
    'Giữ lưng dưới ép phẳng - nếu lưng bị nhấc lên thì hạ chân cao hơn.',
  'Lie on your back with your knees bent and heels close to your hips.':
    'Nằm ngửa, gối gập và gót chân gần sát hông.',
  'Lift your shoulders slightly and reach side to side to touch each heel.':
    'Nhấc nhẹ vai lên và với sang hai bên để chạm từng gót chân.',
  'Lie on your back with both knees dropped to one side.':
    'Nằm ngửa, thả cả hai gối sang một bên.',
  'Curl your shoulders up towards your top hip, then lower with control.':
    'Cuộn vai lên hướng về bên hông phía trên, rồi hạ xuống có kiểm soát.',
  'Hold a forearm plank with your feet about hip width apart.':
    'Giữ plank khuỷu tay với hai chân rộng bằng hông.',
  'Push the hips up towards the ceiling, then lower back to a flat plank.':
    'Đẩy hông lên phía trần nhà, rồi hạ về tư thế plank phẳng.',
  'Sit with your legs straight and your hands on the floor behind your hips.':
    'Ngồi duỗi thẳng chân, hai tay chống sàn phía sau hông.',
  'Press through your hands and heels to lift the hips into a straight line.':
    'Đạp qua tay và gót để nâng hông lên thành một đường thẳng.',
  'Stand tall with your arms bent in front of your chest.':
    'Đứng thẳng, hai tay gập trước ngực.',
  'Rotate your upper body left and right, keeping your hips still.':
    'Xoay phần thân trên sang trái và phải, giữ hông đứng yên.',
  'On all fours, hands under shoulders and knees under hips.':
    'Chống bốn điểm, tay dưới vai và gối dưới hông.',
  'Reach one arm forward and the opposite leg back, pause, and swap.':
    'Vươn một tay ra trước và chân đối diện ra sau, dừng lại rồi đổi bên.',
  'Lie face down with your arms reaching in front of you.':
    'Nằm sấp, hai tay vươn thẳng về phía trước.',
  'Lift your chest, arms and legs a few inches, hold a beat, and lower.':
    'Nhấc ngực, tay và chân lên vài phân, giữ một nhịp rồi hạ xuống.',
  'Lie face down with your elbows bent so your arms make a W.':
    'Nằm sấp, gập khuỷu tay để hai tay tạo thành chữ W.',
  'Lift your hands and chest slightly by squeezing between the shoulder blades.':
    'Nhấc nhẹ tay và ngực lên bằng cách siết giữa hai bả vai.',
  'Hold a band in front of you at chest height with straight arms.':
    'Cầm dây trước mặt ngang ngực với hai tay duỗi thẳng.',
  'Pull it apart until your arms are wide, squeeze, and return slowly.':
    'Kéo dây tách ra tới khi hai tay mở rộng, siết lại, rồi thu về từ từ.',
  'Hold a band at head height and pull it towards your face.':
    'Cầm dây ngang đầu và kéo về phía mặt.',
  'Finish with your hands beside your ears and your elbows above your wrists.':
    'Kết thúc với hai tay cạnh tai và khuỷu tay cao hơn cổ tay.',
  'Stand facing a wall and place both hands on it at chest height.':
    'Đứng đối diện tường và đặt hai tay lên tường ngang ngực.',
  'Walk your hands up the wall as far as you can without your ribs flaring, then back down.':
    'Đi tay lên tường cao nhất có thể mà lồng ngực không bị bung ra, rồi đi xuống.',
  'Stand an arm length from a wall with your hands at shoulder height.':
    'Đứng cách tường một tầm tay, hai tay đặt ngang vai.',
  'Bend your elbows to bring your chest to the wall, then press away.':
    'Gập khuỷu tay đưa ngực về phía tường, rồi đẩy ra.',
  'Stand with your hands behind your head and a soft bend in your knees.':
    'Đứng với hai tay sau đầu và gối hơi chùng.',
  'Push your hips back until you feel your hamstrings, then stand and squeeze your glutes.':
    'Đẩy hông ra sau tới khi cảm nhận cơ đùi sau, rồi đứng lên và siết mông.',
  'Sit or stand tall and look straight ahead.':
    'Ngồi hoặc đứng thẳng và nhìn thẳng về trước.',
  'Draw your chin straight back to make a double chin, hold, and release.':
    'Kéo cằm thẳng ra sau tạo thành cằm đôi, giữ rồi thả.',
  'Swing both arms wide open to stretch across the chest.':
    'Vung cả hai tay mở rộng để giãn ngang phần ngực.',
  'Wrap them around yourself to open up between the shoulder blades, and repeat.':
    'Ôm vòng hai tay quanh người để mở phần giữa hai bả vai, rồi lặp lại.',
  'Bring your hands behind your head with your elbows wide.':
    'Đưa hai tay ra sau đầu, khuỷu tay mở rộng.',
  'Draw the elbows back until you feel the chest open, and breathe there.':
    'Kéo khuỷu tay ra sau tới khi thấy ngực mở ra, và thở ở đó.',
  'Reach both arms overhead and lengthen through your side.':
    'Vươn cả hai tay lên quá đầu và kéo dài phần sườn.',
  'Open one arm behind you as you rotate the upper back, then swap sides.':
    'Mở một tay ra sau khi xoay lưng trên, rồi đổi bên.',
  'Lace your fingers behind your head and lift your chest.':
    'Đan các ngón tay sau đầu và nâng ngực lên.',
  'Ease the elbows back until the front of your shoulders opens, then hold.':
    'Từ từ kéo khuỷu tay ra sau tới khi phần trước vai mở ra, rồi giữ.',
  'Start on all fours with your hands under your shoulders.':
    'Bắt đầu ở tư thế chống bốn điểm với hai tay dưới vai.',
  'Round your back as you breathe out, then arch and lift your chest as you breathe in.':
    'Cong lưng lên khi thở ra, rồi võng lưng và nâng ngực khi hít vào.',
  'Lie face down with your hands under your shoulders.':
    'Nằm sấp với hai tay đặt dưới vai.',
  'Press up to lift your chest, keeping your hips on the floor.':
    'Chống tay nâng ngực lên, giữ hông áp sàn.',
  'From all fours, tuck your toes and lift your hips into an upside-down V.':
    'Từ tư thế chống bốn điểm, gập mũi chân và đẩy hông lên thành chữ V ngược.',
  'Press the floor away, lengthen your spine, and let the heels sink.':
    'Đẩy mạnh xuống sàn, kéo dài cột sống, và để gót chân hạ dần.',
  'Step one foot forward and lower the back knee to the floor.':
    'Bước một chân lên trước và hạ gối sau xuống sàn.',
  'Ease your hips forward until the front of the back hip opens, and hold.':
    'Từ từ đẩy hông về trước tới khi phần trước hông sau mở ra, rồi giữ.',
  'Take a long step forward and sink into a deep lunge.':
    'Bước một bước dài về trước và hạ sâu vào tư thế lunge.',
  'Keep the back leg long and breathe into the front of that hip.':
    'Giữ chân sau duỗi dài và thở vào phần trước của hông đó.',
  'Kneel on one knee with the other foot planted in front.':
    'Quỳ một gối, bàn chân kia đặt vững phía trước.',
  'Squeeze the glute on the kneeling side and ease your hips forward.':
    'Siết cơ mông bên chân quỳ và từ từ đẩy hông về trước.',
  'Sit with the soles of your feet together and your heels near your hips.':
    'Ngồi với hai lòng bàn chân áp vào nhau và gót gần sát hông.',
  'Sit up tall and let your knees settle towards the floor.':
    'Ngồi thẳng lưng và để hai gối hạ dần xuống sàn.',
  'Lie on your back and raise one straight leg towards you.':
    'Nằm ngửa và nâng một chân duỗi thẳng về phía mình.',
  'Hold behind the thigh and keep the other leg flat on the floor.':
    'Giữ phía sau đùi và để chân còn lại áp phẳng xuống sàn.',
  'Put one heel in front of you with that leg straight and toes up.':
    'Đặt một gót chân ra trước, chân duỗi thẳng và mũi chân hướng lên.',
  'Push your hips back and hinge forward until the hamstring pulls.':
    'Đẩy hông ra sau và gập người tới khi cơ đùi sau căng ra.',
  'Hold one ankle behind you and bring the knees level.':
    'Giữ một cổ chân ra sau và đưa hai gối ngang nhau.',
  'Tuck your hips under until the front of the thigh stretches.':
    'Cuộn hông xuống dưới tới khi phần trước đùi được giãn.',
  'Sit with one leg straight out in front of you.':
    'Ngồi với một chân duỗi thẳng ra trước.',
  'Reach for the foot and draw the toes back towards your shin.':
    'Với tới bàn chân và kéo mũi chân về phía ống chân.',
  'Kneel and place both hands on the floor in front of you.':
    'Quỳ xuống và đặt hai tay lên sàn phía trước.',
  'Sit your hips back and let your chest sink between your arms.':
    'Hạ hông ra sau và để ngực chìm xuống giữa hai tay.',
  'Bring one straight arm across your chest.':
    'Đưa một tay duỗi thẳng vắt ngang ngực.',
  'Hook it with the other arm and draw it in, keeping the shoulder down.':
    'Dùng tay kia móc lại và kéo vào, giữ vai hạ xuống.',
  'Sit or stand tall and tilt one ear towards that shoulder.':
    'Ngồi hoặc đứng thẳng và nghiêng một bên tai về phía vai bên đó.',
  'Let the opposite shoulder stay heavy and breathe into the stretch.':
    'Để vai bên kia thả nặng xuống và thở vào phần đang giãn.',
  'Bring both arms out to the sides at shoulder height.':
    'Đưa cả hai tay sang ngang ở độ cao ngang vai.',
  'Draw them back to open the chest, then release, in a steady rhythm.':
    'Kéo tay ra sau để mở ngực, rồi thả ra, theo một nhịp đều.',
  'Reach both arms forward and round your upper back.':
    'Vươn cả hai tay về trước và cuộn tròn lưng trên.',
  'Open the arms wide and lift the chest, then repeat at an easy pace.':
    'Mở rộng hai tay và nâng ngực lên, rồi lặp lại với nhịp thong thả.',
}
