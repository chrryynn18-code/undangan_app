from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# List penyimpanan sementara untuk ucapan dan RSVP tamu
guestbook_messages = []


def calculate_stats():
  """Fungsi helper untuk menghitung statistik kehadiran dan total ucapan."""
  hadir_count = sum(
      1 for m in guestbook_messages if m.get('attendance') == 'Hadir'
  )
  tidak_hadir_count = sum(
      1 for m in guestbook_messages if m.get('attendance') == 'Tidak Hadir'
  )
  total_comments = len(guestbook_messages)
  return hadir_count, tidak_hadir_count, total_comments


@app.route('/')
def index():
  hadir, tidak_hadir, total = calculate_stats()
  return render_template(
      'index.html',
      messages=guestbook_messages,
      hadir=hadir,
      tidak_hadir=tidak_hadir,
      total=total,
  )


@app.route('/send_message', methods=['POST'])
def send_message():
  data = request.json or {}
  name = data.get('name')
  message = data.get('message')
  attendance = data.get('attendance', 'Hadir')

  if not name or not message:
    return (
        jsonify({'status': 'error', 'message': 'Data tidak lengkap'}),
        400,
    )

  new_msg = {
      'name': name,
      'message': message,
      'attendance': attendance,
      'time': 'Baru saja',
  }
  guestbook_messages.insert(0, new_msg)

  hadir, tidak_hadir, total = calculate_stats()

  return jsonify({
      'status': 'success',
      'name': name,
      'message': message,
      'attendance': attendance,
      'time': 'Baru saja',
      'hadir': hadir,
      'tidak_hadir': tidak_hadir,
      'total': total,
  })


@app.route('/delete_message', methods=['POST'])
def delete_message():
  data = request.json or {}
  index = data.get('index')

  if index is None or not (0 <= index < len(guestbook_messages)):
    return jsonify({'status': 'error', 'message': 'Index tidak valid'}), 400

  guestbook_messages.pop(index)
  hadir, tidak_hadir, total = calculate_stats()

  return jsonify(
      {'status': 'success', 'hadir': hadir, 'tidak_hadir': tidak_hadir, 'total': total}
  )


if __name__ == '__main__':
  app.run(debug=True, port=5000)