CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE cita_estado AS ENUM ('activa', 'cancelada');

CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    precio NUMERIC NOT NULL,
    duracion_minutos INT NOT NULL
);

CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    servicio_id UUID REFERENCES servicios(id) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado cita_estado DEFAULT 'activa',
    google_calendar_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint Crítico: Previene colisiones y Race Conditions de forma nativa.
CREATE UNIQUE INDEX uq_cita_activa_fecha_hora ON citas (fecha, hora) WHERE estado = 'activa';

-- Row Level Security (RLS)
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicios visibles para todos" ON servicios FOR SELECT USING (true);
CREATE POLICY "Permitir agendar a todos" ON citas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir ver disponibilidad" ON citas FOR SELECT USING (true);
CREATE POLICY "Permitir actualización de estado" ON citas FOR UPDATE USING (true);
