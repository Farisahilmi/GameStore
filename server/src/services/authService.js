const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const register = async (data) => {
  const { email, password, name, role } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'USER', // Default role is USER
    },
  });

  const token = generateToken({ id: user.id, role: user.role });

  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
};

const login = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, role: user.role });

  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
};

module.exports = {
  register,
  login,
};
