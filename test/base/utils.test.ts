import { convertToFormData, convertToQueryString } from '@fetch-lite/base'
import { describe, expect, it } from 'vitest'

describe('base utils', () => {
  it('convertToFormData', () => {
    const obj = {
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: 10001,
      },
      interests: ['music', 'movies', 'sports'],
      avatar: new File(['myfilecontent'], 'myfile.txt', { type: 'text/plain' }),
    }
    const formData = convertToFormData(obj)
    expect(formData instanceof FormData).toBe(true)
    expect(formData.get('name')).toBe(obj.name)
    expect(formData.get('age')).toBe(obj.age.toString())
    expect(formData.get('address[street]')).toBe(obj.address.street)
    expect(formData.get('address[city]')).toBe(obj.address.city)
    expect(formData.get('interests[1]')).toBe(obj.interests[1])
    expect(formData.get('avatar') instanceof File).toBe(true)
  })

  it('convertToFormData with empty object', () => {
    const formData = convertToFormData({})
    expect(formData instanceof FormData).toBe(true)
    expect([...formData.keys()].length).toBe(0)
  })

  it('convertToFormData with null/undefined values', () => {
    const obj = {
      name: 'test',
      nullValue: null,
      undefinedValue: undefined,
    }
    const formData = convertToFormData(obj)
    expect(formData.get('name')).toBe('test')
  })

  it('convertToQueryString', () => {
    const obj = {
      name: 'John Doe',
      age: 30,
    }
    const query = convertToQueryString(obj)
    expect(query).toBe('name=John%20Doe&age=30')
  })

  it('convertToQueryString with special characters', () => {
    const obj = {
      query: '中文',
      symbol: '&=?',
    }
    const query = convertToQueryString(obj)
    expect(query).toContain('%')
    expect(decodeURIComponent(query)).toContain('中文')
  })

  it('convertToQueryString with empty object', () => {
    const query = convertToQueryString({})
    expect(query).toBe('')
  })
})
